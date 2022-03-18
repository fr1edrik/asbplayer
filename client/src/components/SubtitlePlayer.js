import React, { useCallback, useEffect, useState, useMemo, useRef, createRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createAndDownloadFile, keysAreEqual, getSubtitleToNode } from '../services/Util';
import { useWindowSize } from '../hooks/useWindowSize';
import { KeyBindings, surroundingSubtitles } from '@project/common';
import FileCopy from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import ContextMenuWrapper from './ContextMenu';
import { stringifySync } from 'subtitle';

const useSubtitlePlayerStyles = makeStyles((theme) => ({
    container: {
        height: 'calc(100vh - 64px)',
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: theme.palette.background.default,
        width: ({ compressed, windowWidth }) => (compressed ? Math.max(350, 0.25 * windowWidth) : '100%'),
    },
    table: {
        backgroundColor: theme.palette.background.default,
        marginBottom: 75, // so the last row doesn't collide with controls
    },
    noSubtitles: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        textAlign: 'center',
    },
}));

const useSubtitleRowStyles = makeStyles((theme) => ({
    subtitleRow: {
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    subtitle: {
        fontSize: 20,
        paddingRight: 0,
        minWidth: 200,
        width: '100%',
        overflowWrap: 'anywhere',
    },
    compressedSubtitle: {
        fontSize: 16,
        paddingRight: 0,
        minWidth: 200,
        width: '100%',
        overflowWrap: 'anywhere',
    },
    disabledSubtitle: {
        color: 'transparent',
        backgroundColor: theme.palette.action.disabledBackground,
        borderRadius: 5,
    },
    timestamp: {
        fontSize: 14,
        color: '#aaaaaa',
        textAlign: 'right',
        paddingRight: 15,
        paddingLeft: 5,
    },
    copyButton: {
        textAlign: 'right',
        padding: 0,
    },
}));

const SubtitleRow = React.memo((props) => {
    const { index, compressed, selected, disabled, subtitle, subtitleRef, onClick, onCopy, ...tableRowProps } = props;
    const classes = useSubtitleRowStyles();
    const textRef = useRef();
    const [textSelected, setTextSelected] = useState(false);
    let className = compressed ? classes.compressedSubtitle : classes.subtitle;
    let disabledClassName = disabled ? classes.disabledSubtitle : '';

    if (subtitle.start < 0 || subtitle.end < 0) {
        return null;
    }

    function handleMouseUp(e) {
        var selection = document.getSelection();
        setTextSelected(selection?.type === 'Range' && textRef.current?.isSameNode(selection.anchorNode.parentNode));
    }

    return (
        <TableRow
            onClick={(e) => !textSelected && onClick(index)}
            onMouseUp={handleMouseUp}
            ref={subtitleRef}
            className={classes.subtitleRow}
            selected={selected}
            {...tableRowProps}
        >
            <TableCell className={className}>
                <span ref={textRef} className={disabledClassName}>
                    {subtitle.text}
                </span>
            </TableCell>
            <TableCell className={classes.copyButton}>
                <IconButton onClick={(e) => onCopy(e, index)}>
                    <FileCopy fontSize={compressed ? 'small' : 'default'} />
                </IconButton>
            </TableCell>
            <TableCell className={classes.timestamp}>{subtitle.displayTime}</TableCell>
        </TableRow>
    );
});

export default function SubtitlePlayer({
    title,
    clock,
    onSeek,
    onCopy,
    onOffsetChange,
    onAnkiDialogRequest,
    onToggleSubtitleTrack,
    playing,
    subtitles,
    length,
    jumpToSubtitle,
    compressed,
    loading,
    drawerOpen,
    displayHelp,
    disableKeyEvents,
    lastJumpToTopTimestamp,
    hidden,
    disabledSubtitleTracks,
    settingsProvider,
}) {
    const playingRef = useRef();
    playingRef.current = playing;
    const clockRef = useRef();
    clockRef.current = clock;
    const subtitleListRef = useRef();
    subtitleListRef.current = subtitles;
    const subtitleRefs = useMemo(
        () =>
            subtitles
                ? Array(subtitles.length)
                      .fill()
                      .map((_, i) => createRef())
                : [],
        [subtitles]
    );
    const subtitleRefsRef = useRef();
    subtitleRefsRef.current = subtitleRefs;
    const disableKeyEventsRef = useRef();
    disableKeyEventsRef.current = disableKeyEvents;
    const [selectedSubtitleIndexes, setSelectedSubtitleIndexes] = useState({});
    const selectedSubtitleIndexesRef = useRef({});
    const lengthRef = useRef();
    lengthRef.current = length;
    const hiddenRef = useRef();
    hiddenRef.current = hidden;
    const lastScrollTimestampRef = useRef(0);
    const requestAnimationRef = useRef();
    const containerRef = useRef();
    const drawerOpenRef = useRef();
    drawerOpenRef.current = drawerOpen;
    const [windowWidth] = useWindowSize(true);
    const classes = useSubtitlePlayerStyles({ compressed, windowWidth });

    // This effect should be scheduled only once as re-scheduling seems to cause performance issues.
    // Therefore all of the state it operates on is contained in refs.
    useEffect(() => {
        const update = (time) => {
            const subtitles = subtitleListRef.current || [];
            const subtitleRefs = subtitleRefsRef.current;
            const length = lengthRef.current;
            const clock = clockRef.current;
            const progress = clock.progress(lengthRef.current);

            let smallestIndex = Number.MAX_SAFE_INTEGER;
            let fallbackIndex = -1;
            const currentSubtitleIndexes = {};

            for (let i = subtitles.length - 1; i >= 0; --i) {
                const s = subtitles[i];
                const start = s.start / length;
                const end = s.end / length;

                if (progress >= start) {
                    if (progress < end) {
                        smallestIndex = i < smallestIndex ? i : smallestIndex;
                        currentSubtitleIndexes[i] = true;
                    }

                    if (fallbackIndex === -1) {
                        fallbackIndex = i;
                    }
                } else if (smallestIndex !== Number.MAX_SAFE_INTEGER) {
                    break;
                }
            }

            // Attempt to highlight *something* if no subtitles were found at the current timestamp
            if (smallestIndex === Number.MAX_SAFE_INTEGER && fallbackIndex !== -1) {
                currentSubtitleIndexes[fallbackIndex] = true;
            }

            if (!keysAreEqual(currentSubtitleIndexes, selectedSubtitleIndexesRef.current)) {
                selectedSubtitleIndexesRef.current = currentSubtitleIndexes;
                setSelectedSubtitleIndexes(currentSubtitleIndexes);

                if (smallestIndex !== Number.MAX_SAFE_INTEGER) {
                    const scrollToSubtitleRef = subtitleRefs[smallestIndex];
                    const allowScroll = !hiddenRef.current && Date.now() - lastScrollTimestampRef.current > 5000;

                    if (scrollToSubtitleRef?.current && allowScroll) {
                        scrollToSubtitleRef.current.scrollIntoView({
                            block: 'center',
                            inline: 'nearest',
                            behavior: 'smooth',
                        });
                    }
                }
            }

            requestAnimationRef.current = requestAnimationFrame(update);
        };

        requestAnimationRef.current = requestAnimationFrame(update);

        return () => cancelAnimationFrame(requestAnimationRef.current);
    }, []);

    const scrollToCurrentSubtitle = useCallback(() => {
        const selectedSubtitleIndexes = selectedSubtitleIndexesRef.current;

        if (!selectedSubtitleIndexes) {
            return;
        }

        const indexes = Object.keys(selectedSubtitleIndexes);

        if (indexes.length === 0) {
            return;
        }

        const scrollToSubtitleRef = subtitleRefs[indexes[0]];

        scrollToSubtitleRef?.current?.scrollIntoView({
            block: 'center',
            inline: 'nearest',
            behavior: 'smooth',
        });
    }, [subtitleRefs]);

    useEffect(() => {
        if (hidden) {
            return;
        }

        function scrollIfVisible() {
            if (document.visibilityState === 'visible') {
                scrollToCurrentSubtitle();
            }
        }

        document.addEventListener('visibilitychange', scrollIfVisible);

        return () => document.removeEventListener('visibilitychange', scrollIfVisible);
    }, [hidden, selectedSubtitleIndexes, subtitleRefs, scrollToCurrentSubtitle]);

    useEffect(() => {
        if (!hidden) {
            scrollToCurrentSubtitle();
        }
    }, [hidden, scrollToCurrentSubtitle]);

    useEffect(() => {
        if (hiddenRef.current) {
            return;
        }

        const subtitleRefs = subtitleRefsRef.current;

        if (!subtitleRefs || subtitleRefs.length === 0) {
            return;
        }

        const firstSubtitleRef = subtitleRefs[0];
        firstSubtitleRef?.current?.scrollIntoView({
            block: 'center',
            inline: 'nearest',
            behavior: 'smooth',
        });
    }, [lastJumpToTopTimestamp]);

    useEffect(() => {
        const unbind = KeyBindings.bindAdjustOffset(
            (event, offset) => {
                event.preventDefault();
                event.stopPropagation();
                onOffsetChange(offset);
            },
            () => disableKeyEvents,
            () => subtitles
        );

        return () => unbind();
    }, [onOffsetChange, disableKeyEvents, subtitles]);

    useEffect(() => {
        const unbind = KeyBindings.bindOffsetToSubtitle(
            (event, offset) => {
                event.preventDefault();
                event.stopPropagation();
                onOffsetChange(offset);
            },
            () => disableKeyEvents,
            () => clock.time(length),
            () => subtitles
        );

        return () => unbind();
    }, [onOffsetChange, disableKeyEvents, clock, subtitles, length]);

    useEffect(() => {
        const unbind = KeyBindings.bindSeekToSubtitle(
            (event, subtitle) => {
                event.preventDefault();
                event.stopPropagation();
                onSeek(subtitle.start, false);
            },
            () => disableKeyEvents,
            () => clock.time(length),
            () => subtitles
        );

        return () => unbind();
    }, [onSeek, subtitles, disableKeyEvents, clock, length]);

    useEffect(() => {
        function handleScroll(event) {
            lastScrollTimestampRef.current = Date.now();
        }

        const table = containerRef.current;
        table?.addEventListener('wheel', handleScroll);

        return () => table?.removeEventListener('wheel', handleScroll);
    }, [containerRef, lastScrollTimestampRef]);

    useEffect(() => {
        if (hidden) {
            return;
        }

        if (!jumpToSubtitle || !subtitles) {
            return;
        }

        let jumpToIndex = -1;
        let i = 0;

        for (let s of subtitles) {
            if (s.originalStart === jumpToSubtitle.originalStart && s.text === jumpToSubtitle.text) {
                jumpToIndex = i;
                break;
            }

            ++i;
        }

        if (jumpToIndex !== -1) {
            subtitleRefs[jumpToIndex]?.current?.scrollIntoView({
                block: 'center',
                inline: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [hidden, jumpToSubtitle, subtitles, subtitleRefs]);

    const calculateSurroundingSubtitlesForIndex = useCallback(
        (index) => {
            if (!selectedSubtitleIndexesRef.current) {
                return [];
            }

            return surroundingSubtitles(
                subtitles,
                index,
                settingsProvider.surroundingSubtitlesCountRadius,
                settingsProvider.surroundingSubtitlesTimeRadius
            );
        },
        [subtitles, settingsProvider.surroundingSubtitlesCountRadius, settingsProvider.surroundingSubtitlesTimeRadius]
    );

    const calculateSurroundingSubtitles = useCallback(() => {
        if (!selectedSubtitleIndexesRef.current) {
            return [];
        }

        const index = Math.min(Object.keys(selectedSubtitleIndexesRef.current));
        return calculateSurroundingSubtitlesForIndex(index);
    }, [calculateSurroundingSubtitlesForIndex]);

    useEffect(() => {
        const unbind = KeyBindings.bindCopy(
            (event, subtitle) => {
                event.preventDefault();
                event.stopPropagation();
                onCopy(subtitle, calculateSurroundingSubtitles(), false);
            },
            () => disableKeyEventsRef.current,
            () => {
                const subtitleIndexes = Object.keys(selectedSubtitleIndexesRef.current);

                if (!subtitleIndexes || subtitleIndexes.length === 0) {
                    return null;
                }

                const index = Math.min(...subtitleIndexes);
                return subtitles[index];
            }
        );

        return () => unbind();
    }, [subtitles, calculateSurroundingSubtitles, onCopy]);

    useEffect(() => {
        const unbind = KeyBindings.bindToggleSubtitleTrackInList(
            (event, track) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleSubtitleTrack(track);
            },
            () => {},
            () => disableKeyEvents
        );

        return () => unbind();
    }, [disableKeyEvents, onToggleSubtitleTrack]);

    useEffect(() => {
        const unbind = KeyBindings.bindAnkiExport(
            (event) => {
                event.preventDefault();
                event.stopPropagation();
                const subtitleIndexes = Object.keys(selectedSubtitleIndexesRef.current);

                if (subtitleIndexes && subtitleIndexes.length > 0) {
                    const index = Math.min(...subtitleIndexes);
                    onCopy(subtitles[index], calculateSurroundingSubtitlesForIndex(index), true);
                }

                onAnkiDialogRequest();
            },
            () => false
        );

        return () => unbind();
    }, [onAnkiDialogRequest, onCopy, subtitles, calculateSurroundingSubtitlesForIndex]);

    const handleClick = useCallback(
        (index) => {
            const selectedSubtitleIndexes = selectedSubtitleIndexesRef.current || {};
            onSeek(subtitles[index].start, !playingRef.current && index in selectedSubtitleIndexes);
        },
        [subtitles, onSeek]
    );

    const handleCopy = useCallback(
        (e, index) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy(subtitles[index], calculateSurroundingSubtitlesForIndex(index), false);
        },
        [subtitles, calculateSurroundingSubtitlesForIndex, onCopy]
    );

    let subtitleTable = null;

    if (!subtitles || subtitles.length === 0) {
        if (!loading && displayHelp) {
            subtitleTable = !loading && displayHelp && (
                <div className={classes.noSubtitles}>
                    <Typography variant="h6">{displayHelp}</Typography>
                </div>
            );
        } else if (subtitles && subtitles.length === 0) {
            subtitleTable = (
                <div className={classes.noSubtitles}>
                    <Typography variant="h6">No subtitles</Typography>
                </div>
            );
        }
    } else {
        subtitleTable = (
            <TableContainer className={classes.table} on>
                <Table>
                    <TableBody>
                        {subtitles.map((s, index) => {
                            const selected = index in selectedSubtitleIndexes;

                            return (
                                <SubtitleRow
                                    key={index}
                                    index={index}
                                    compressed={compressed}
                                    selected={selected}
                                    disabled={disabledSubtitleTracks[s.track]}
                                    subtitle={subtitles[index]}
                                    subtitleRef={subtitleRefs[index]}
                                    onClick={handleClick}
                                    onCopy={handleCopy}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    const downloadAllSubtitles = () => {
        if (!subtitles) {
            return;
        }

        const filename = prompt('Please enter a filename', title);
        if (filename == null) {
            return;
        }
        const srtText = stringifySync(subtitles.map(getSubtitleToNode), { format: 'SRT' });
        createAndDownloadFile(`${filename || ''}.srt`, srtText);
    };

    const menuItems = [{ label: 'Download Subtitles', onClick: downloadAllSubtitles }];

    return (
        <ContextMenuWrapper menuItems={menuItems} disabled={subtitles === undefined || subtitles.length === 0}>
            <Paper square elevation={0} ref={containerRef} className={classes.container}>
                {subtitleTable}
            </Paper>
        </ContextMenuWrapper>
    );
}
