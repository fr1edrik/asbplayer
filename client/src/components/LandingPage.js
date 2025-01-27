import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import gt from 'semver/functions/gt';
import Fade from '@material-ui/core/Fade';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    background: {
        position: 'absolute',
        height: 'calc(100vh - 64px)',
        width: '100%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        textAlign: 'center',
    },
    browseLink: {
        cursor: 'pointer',
    },
}));

export default function LandingPage({
    extension,
    latestExtensionVersion,
    extensionUrl,
    loading,
    dragging,
    onFileSelector,
}) {
    const classes = useStyles();
    const [installedExtensionVersion, setInstalledExtensionVersion] = useState();

    useEffect(() => {
        async function fetchInstalledExtensionVersion() {
            setInstalledExtensionVersion(await extension.installedVersion());
        }

        fetchInstalledExtensionVersion();
    }, [extension]);

    const extensionUpdateAvailable = installedExtensionVersion && gt(latestExtensionVersion, installedExtensionVersion);
    const extensionNotInstalled = !installedExtensionVersion;

    return (
        <React.Fragment>
            <Fade in={!loading && !dragging} timeout={500}>
                <div className={classes.background}>
                    <Typography variant="h6">
                        Drag and drop subtitle and media files, or{' '}
                        <Link
                            target="#"
                            className={classes.browseLink}
                            onClick={onFileSelector}
                            color="secondary"
                            component="label"
                        >
                            browse
                        </Link>
                        .
                        <br />
                        {extensionNotInstalled && (
                            <span>
                                Install the{' '}
                                <Link color="secondary" target="_blank" rel="noreferrer" href={extensionUrl}>
                                    Chrome extension
                                </Link>{' '}
                                to sync subtitles with streaming video.
                            </span>
                        )}
                        {extensionUpdateAvailable && (
                            <span>
                                An extension{' '}
                                <Link color="secondary" target="_blank" rel="noreferrer" href={extensionUrl}>
                                    update
                                </Link>{' '}
                                is available.
                            </span>
                        )}
                    </Typography>
                </div>
            </Fade>
        </React.Fragment>
    );
}
