import React, {  useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import CustomFieldDialog from './CustomFieldDialog';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';
import Select from '@material-ui/core/Select';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
    },
    subtitleSetting: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            width: 320
        },
    },
    addFieldButton: {
        width: "100%"
    }
}));

const useSelectableSettingStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    root: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "end",
        alignItems: "flex-end",
    }
}));

function SelectableSetting({label, value, selections, removable, onChange, onSelectionChange, onRemoval}) {
    const classes = useSelectableSettingStyles();

    return (
        <div className={classes.root}>
            <TextField
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
                InputProps={{
                    endAdornment: removable && (
                        <InputAdornment position="end">
                            <IconButton onClick={(e) => onRemoval?.()}>
                                <DeleteIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <FormControl className={classes.formControl}>
                <InputLabel></InputLabel>
                <Select
                    value={value}
                    disabled={!selections}
                    onChange={onSelectionChange}
                >
                    {selections && selections.map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

function Centered(props) {
    return (
        <Grid container
            spacing={0}
            direction="row"
            alignItems="center"
            justify="center"
        >
            <Grid item>
                {props.children}
            </Grid>
        </Grid>
    );
}

export default function SettingsDialog({anki, open, settings, onClose}) {
    const classes = useStyles();
    const [tabIndex, setTabIndex] = useState(0);
    const [ankiConnectUrl, setAnkiConnectUrl] = useState(settings.ankiConnectUrl);
    const [ankiConnectUrlError, setAnkiConnectUrlError] = useState();
    const [ankiConnectUrlChangeTimestamp, setAnkiConnectUrlChangeTimestamp] = useState(0);
    const [deck, setDeck] = useState(settings.deck || "");
    const [deckNames, setDeckNames] = useState();
    const [noteType, setNoteType] = useState(settings.noteType || "");
    const [modelNames, setModelNames] = useState();
    const [sentenceField, setSentenceField] = useState(settings.sentenceField || "");
    const [definitionField, setDefinitionField] = useState(settings.definitionField || "");
    const [audioField, setAudioField] = useState(settings.audioField || "");
    const [imageField, setImageField] = useState(settings.imageField || "");
    const [wordField, setWordField] = useState(settings.wordField || "");
    const [sourceField, setSourceField] = useState(settings.sourceField || "");
    const [customFields, setCustomFields] = useState(settings.customAnkiFields);
    const [fieldNames, setFieldNames] = useState();
    const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
    const [subtitleColor, setSubtitleColor] = useState(settings.subtitleColor);
    const [subtitleSize, setSubtitleSize] = useState(settings.subtitleSize);
    const [subtitleOutlineColor, setSubtitleOutlineColor] = useState(settings.subtitleOutlineColor);
    const [subtitleOutlineThickness, setSubtitleOutlineThickness] = useState(settings.subtitleOutlineThickness);
    const [subtitleBackgroundColor, setSubtitleBackgroundColor] = useState(settings.subtitleBackgroundColor);
    const [subtitleBackgroundOpacity, setSubtitleBackgroundOpacity] = useState(settings.subtitleBackgroundOpacity);

    const handleAnkiConnectUrlChange = useCallback((e) => {
        setAnkiConnectUrl(e.target.value);
        setAnkiConnectUrlChangeTimestamp(Date.now());
    }, []);

    const handleRetryAnkiConnectUrl = useCallback((e) => setAnkiConnectUrlChangeTimestamp(Date.now()), []);
    const handleDeckChange = useCallback((e) => setDeck(e.target.value), []);
    const handleNoteTypeChange = useCallback((e) => setNoteType(e.target.value), []);
    const handleSentenceFieldChange = useCallback((e) => setSentenceField(e.target.value), []);
    const handleDefinitionFieldChange = useCallback((e) => setDefinitionField(e.target.value), []);
    const handleAudioFieldChange = useCallback((e) => setAudioField(e.target.value), []);
    const handleImageFieldChange = useCallback((e) => setImageField(e.target.value), []);
    const handleWordFieldChange = useCallback((e) => setWordField(e.target.value), []);
    const handleSourceFieldChange = useCallback((e) => setSourceField(e.target.value), []);
    const handleSubtitleColorChange = useCallback((e) => setSubtitleColor(e.target.value), []);
    const handleSubtitleSizeChange = useCallback((e) => setSubtitleSize(e.target.value), []);
    const handleSubtitleOutlineColorChange = useCallback((e) => setSubtitleOutlineColor(e.target.value), []);
    const handleSubtitleOutlineThicknessChange = useCallback((e) => setSubtitleOutlineThickness(e.target.value), []);
    const handleSubtitleBackgroundColorChange = useCallback((e) => setSubtitleBackgroundColor(e.target.value), []);
    const handleSubtitleBackgroundOpacityChange = useCallback((e) => setSubtitleBackgroundOpacity(e.target.value), []);
    const handleAddCustomField = useCallback((customFieldName) => {
        setCustomFields(oldCustomFields => {
            const newCustomFields = {};
            Object.assign(newCustomFields, oldCustomFields);
            newCustomFields[customFieldName] = "";
            return newCustomFields;
        });
        setCustomFieldDialogOpen(false);
    }, []);
    const handleCustomFieldChange = useCallback((customFieldName, value) => {
        setCustomFields(oldCustomFields => {
            const newCustomFields = {};
            Object.assign(newCustomFields, oldCustomFields);
            newCustomFields[customFieldName] = value;
            return newCustomFields;
        });
    }, []);
    const handleCustomFieldRemoval = useCallback((customFieldName) => setCustomFields(oldCustomFields => {
        const newCustomFields = {};
        Object.assign(newCustomFields, oldCustomFields);
        delete newCustomFields[customFieldName];
        return newCustomFields;
    }), []);

    useEffect(() => {
        let canceled = false;

        const timeout = setTimeout(async () => {
            try {
                if (canceled) {
                    return;
                }

                setDeckNames(await anki.deckNames(ankiConnectUrl));
                setModelNames(await anki.modelNames(ankiConnectUrl));
                setAnkiConnectUrlError(null);
            } catch (e) {
                if (canceled) {
                    return;
                }

                console.error(e);
                setDeckNames(null);
                setModelNames(null);
                setAnkiConnectUrlError(e.message);
            }
        }, 1000);

        return () => {
            canceled = true;
            clearTimeout(timeout);
        };
    }, [anki, ankiConnectUrl, ankiConnectUrlChangeTimestamp]);

    useEffect(() => {
        if (!noteType || ankiConnectUrlError) {
            return;
        }

        let canceled = false;

        async function refreshFieldNames() {
            try {
                if (canceled) {
                    return;
                }

                setFieldNames(["", ...await anki.modelFieldNames(noteType, ankiConnectUrl)]);
                setAnkiConnectUrlError(null);
            } catch (e) {
                if (canceled) {
                    return;
                }

                console.error(e);
                setFieldNames(null);
                setAnkiConnectUrlError(e.message);
            }
        }

        refreshFieldNames();

        return () => canceled = true;
    }, [anki, noteType, ankiConnectUrl, ankiConnectUrlError, ankiConnectUrlChangeTimestamp]);

    const handleClose = useCallback(() => {
        onClose({
            ankiConnectUrl: ankiConnectUrl,
            deck: deck,
            noteType: noteType,
            sentenceField: sentenceField,
            definitionField: definitionField,
            audioField: audioField,
            imageField: imageField,
            wordField: wordField,
            sourceField: sourceField,
            subtitleSize: Number(subtitleSize),
            subtitleColor: subtitleColor,
            subtitleOutlineThickness: Number(subtitleOutlineThickness),
            subtitleOutlineColor: subtitleOutlineColor,
            subtitleBackgroundColor: subtitleBackgroundColor,
            subtitleBackgroundOpacity: Number(subtitleBackgroundOpacity),
            customAnkiFields: customFields
        });
    }, [onClose, ankiConnectUrl, deck, noteType, sentenceField, definitionField, audioField, imageField, wordField, sourceField, customFields, subtitleSize, subtitleColor, subtitleOutlineThickness, subtitleOutlineColor, subtitleBackgroundColor, subtitleBackgroundOpacity]);

    const customFieldInputs = Object.keys(customFields).map(customFieldName => {
        return (
            <SelectableSetting
                key={customFieldName}
                label={`${customFieldName} Field`}
                value={customFields[customFieldName]}
                selections={fieldNames}
                onChange={e => handleCustomFieldChange(customFieldName, e.target.value)}
                onSelectionChange={e => handleCustomFieldChange(customFieldName, e.target.value)}
                onRemoval={() => handleCustomFieldRemoval(customFieldName)}
                removable={true}
            />
        );
    });

    return (
        <React.Fragment>
            <CustomFieldDialog
                open={customFieldDialogOpen}
                existingCustomFieldNames={Object.keys(customFields)}
                onProceed={handleAddCustomField}
                onCancel={() => setCustomFieldDialogOpen(false)}
            />
            <Dialog
                open={open}
                maxWidth="xs"
                fullWidth
                onBackdropClick={handleClose}
            >
                <Tabs
                    value={tabIndex}
                    variant="fullWidth"
                    onChange={(e, newIndex) => setTabIndex(newIndex)}
                >
                    <Tab label="Anki" />
                    <Tab label="In-Video Subtitles" />
                </Tabs>
                {tabIndex === 0 && (
                    <DialogContent>
                        <DialogContentText>
                            Ensure that {window.location.protocol + "//" + window.location.hostname} is in the webCorsOriginList in your AnkiConnect settings.
                            Leaving a field blank is fine.
                        </DialogContentText>
                        <Centered>
                            <form className={classes.root}>
                                <div>
                                    <TextField
                                        label="Anki Connect URL"
                                        value={ankiConnectUrl}
                                        error={Boolean(ankiConnectUrlError)}
                                        helperText={ankiConnectUrlError}
                                        onChange={handleAnkiConnectUrlChange}
                                    />
                                </div>
                                <SelectableSetting
                                    label="Deck"
                                    value={deck}
                                    selections={deckNames}
                                    onChange={handleDeckChange}
                                    onSelectionChange={handleDeckChange}
                                />
                                <SelectableSetting
                                    label="Note Type"
                                    value={noteType}
                                    selections={modelNames}
                                    onChange={handleNoteTypeChange}
                                    onSelectionChange={handleNoteTypeChange}
                                />
                                <SelectableSetting
                                    label="Sentence Field"
                                    value={sentenceField}
                                    selections={fieldNames}
                                    onChange={handleSentenceFieldChange}
                                    onSelectionChange={handleSentenceFieldChange}
                                />
                                <SelectableSetting
                                    label="Definition Field"
                                    value={definitionField}
                                    selections={fieldNames}
                                    onChange={handleDefinitionFieldChange}
                                    onSelectionChange={handleDefinitionFieldChange}
                                />
                                <SelectableSetting
                                    label="Word Field"
                                    value={wordField}
                                    selections={fieldNames}
                                    onChange={handleWordFieldChange}
                                    onSelectionChange={handleWordFieldChange}
                                />
                                <SelectableSetting
                                    label="Audio Field"
                                    value={audioField}
                                    selections={fieldNames}
                                    onChange={handleAudioFieldChange}
                                    onSelectionChange={handleAudioFieldChange}
                                />
                                <SelectableSetting
                                    label="Image Field"
                                    value={imageField}
                                    selections={fieldNames}
                                    onChange={handleImageFieldChange}
                                    onSelectionChange={handleImageFieldChange}
                                />
                                <SelectableSetting
                                    label="Source Field"
                                    value={sourceField}
                                    selections={fieldNames}
                                    onChange={handleSourceFieldChange}
                                    onSelectionChange={handleSourceFieldChange}
                                />
                                {customFieldInputs}
                                <Button
                                    className={classes.addFieldButton}
                                    onClick={(e) => setCustomFieldDialogOpen(true)}
                                >
                                    Add Custom Field
                                </Button>
                            </form>
                        </Centered>
                    </DialogContent>
                )}
                {tabIndex === 1 && (
                    <DialogContent>
                        <Centered>
                            <form className={classes.root}>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="color"
                                        label="Subtitle Color"
                                        value={subtitleColor}
                                        onChange={handleSubtitleColorChange}
                                    />
                                </div>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="number"
                                        label="Subtitle Size"
                                        value={subtitleSize}
                                        onChange={handleSubtitleSizeChange}
                                        inputProps={{
                                            min: 1,
                                            step: 1
                                        }}
                                    />
                                </div>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="color"
                                        label="Subtitle Outline Color"
                                        value={subtitleOutlineColor}
                                        onChange={handleSubtitleOutlineColorChange}
                                    />
                                </div>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="number"
                                        label="Subtitle Outline Thickness"
                                        value={subtitleOutlineThickness}
                                        onChange={handleSubtitleOutlineThicknessChange}
                                        inputProps={{
                                            min: 0,
                                            step: 1
                                        }}
                                    />
                                </div>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="color"
                                        label="Subtitle Background Color"
                                        value={subtitleBackgroundColor}
                                        onChange={handleSubtitleBackgroundColorChange}
                                    />
                                </div>
                                <div className={classes.subtitleSetting}>
                                    <TextField
                                        type="number"
                                        label="Subtitle Background Opacity"
                                        inputProps={{
                                            min: 0,
                                            max: 1,
                                            step: 0.1
                                        }}
                                        value={subtitleBackgroundOpacity}
                                        onChange={handleSubtitleBackgroundOpacityChange}
                                    />
                                </div>
                            </form>
                        </Centered>
                    </DialogContent>
                )}
                <DialogActions>
                    {tabIndex === 0 && (<Button onClick={handleRetryAnkiConnectUrl}>Retry Anki URL</Button>)}
                    <Button onClick={handleClose}>OK</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}