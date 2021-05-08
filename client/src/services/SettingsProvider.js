const defaultAnkiConnectUrl = "http://127.0.0.1:8765";
const defaultSubtitleSize = 36;
const defaultSubtitleColor = "#ffffff";
const defaultSubtitleOutlineThickness = 0;
const defaultSubtitleOutlineColor = "#000000";
const defaultSubtitleBackgroundColor = "#000000";
const defaultSubtitleBackgroundOpacity = 0.5;
const defaultVolume = 100;

const ankiConnectUrlKey = "ankiConnectUrl";
const deckKey = "deck";
const noteTypeKey = "noteType";
const sentenceFieldKey = "sentenceField";
const definitionFieldKey = "definitionField";
const audioFieldKey = "audioField";
const imageFieldKey = "imageField";
const wordFieldKey = "wordField";
const sourceFieldKey = "sourceField";
const customAnkiFieldsKey = "customAnkiFields";
const subtitleSizeKey = "subtitleSize";
const subtitleColorKey = "subtitleColor";
const subtitleOutlineThicknessKey = "subtitleOutlineThickness";
const subtitleOutlineColorKey = "subtitleOutlineColor";
const subtitleBackgroundColorKey = "subtitleBackgroundColor";
const subtitleBackgroundOpacityKey = "subtitleBackgroundOpacity";
const volumeKey = "volume";

export default class SettingsProvider {

    get settings() {
        return {
            ankiConnectUrl: this.ankiConnectUrl,
            deck: this.deck,
            noteType: this.noteType,
            sentenceField: this.sentenceField,
            definitionField: this.definitionField,
            audioField: this.audioField,
            imageField: this.imageField,
            wordField: this.wordField,
            customAnkiFields: this.customAnkiFields,
            sourceField: this.sourceField,
            subtitleSize: this.subtitleSize,
            subtitleColor: this.subtitleColor,
            subtitleOutlineThickness: this.subtitleOutlineThickness,
            subtitleOutlineColor: this.subtitleOutlineColor,
            subtitleBackgroundColor: this.subtitleBackgroundColor,
            subtitleBackgroundOpacity : this.subtitleBackgroundOpacity,
        };
    }

    get subtitleSettings() {
        return {
            subtitleSize: this.subtitleSize,
            subtitleColor: this.subtitleColor,
            subtitleOutlineThickness: this.subtitleOutlineThickness,
            subtitleOutlineColor: this.subtitleOutlineColor,
            subtitleBackgroundColor: this.subtitleBackgroundColor,
            subtitleBackgroundOpacity : this.subtitleBackgroundOpacity,
        };
    }

    get ankiConnectUrl() {
        return localStorage.getItem(ankiConnectUrlKey) || defaultAnkiConnectUrl;
    }

    set ankiConnectUrl(url) {
        localStorage.setItem(ankiConnectUrlKey, url);
    }

    get deck() {
        return localStorage.getItem(deckKey);
    }

    set deck(deck) {
        localStorage.setItem(deckKey, deck);
    }

    get noteType() {
        return localStorage.getItem(noteTypeKey);
    }

    set noteType(noteType) {
        localStorage.setItem(noteTypeKey, noteType);
    }

    get sentenceField() {
        return localStorage.getItem(sentenceFieldKey);
    }

    set sentenceField(sentenceField) {
        localStorage.setItem(sentenceFieldKey, sentenceField);
    }

    get definitionField() {
        return localStorage.getItem(definitionFieldKey);
    }

    set definitionField(definitionField) {
        localStorage.setItem(definitionFieldKey, definitionField);
    }

    get audioField() {
        return localStorage.getItem(audioFieldKey);
    }

    set audioField(audioField) {
        localStorage.setItem(audioFieldKey, audioField);
    }

    get imageField() {
        return localStorage.getItem(imageFieldKey);
    }

    set imageField(imageField) {
        localStorage.setItem(imageFieldKey, imageField);
    }

    get wordField() {
        return localStorage.getItem(wordFieldKey);
    }

    set wordField(wordField) {
        localStorage.setItem(wordFieldKey, wordField);
    }

    get sourceField() {
        return localStorage.getItem(sourceFieldKey);
    }

    set sourceField(sourceField) {
        localStorage.setItem(sourceFieldKey, sourceField);
    }

    get customAnkiFields() {
        const ankiFieldsString = localStorage.getItem(customAnkiFieldsKey);

        if (ankiFieldsString) {
            return JSON.parse(ankiFieldsString);
        }

        return {};
    }

    set customAnkiFields(customAnkiFields) {
        localStorage.setItem(customAnkiFieldsKey, JSON.stringify(customAnkiFields));
    }

    get subtitleColor() {
        return localStorage.getItem(subtitleColorKey) || defaultSubtitleColor;
    }

    set subtitleColor(subtitleColor) {
        localStorage.setItem(subtitleColorKey, subtitleColor);
    }

    get subtitleSize() {
        return localStorage.getItem(subtitleSizeKey) || defaultSubtitleSize;
    }

    set subtitleSize(subtitleSize) {
        localStorage.setItem(subtitleSizeKey, subtitleSize);
    }

    get subtitleOutlineColor() {
        return localStorage.getItem(subtitleOutlineColorKey) || defaultSubtitleOutlineColor;
    }

    set subtitleOutlineColor(subtitleOutlineColor) {
        localStorage.setItem(subtitleOutlineColorKey, subtitleOutlineColor);
    }

    get subtitleOutlineThickness() {
        return localStorage.getItem(subtitleOutlineThicknessKey) || defaultSubtitleOutlineThickness;
    }

    set subtitleOutlineThickness(subtitleOutlineThickness) {
        localStorage.setItem(subtitleOutlineThicknessKey, subtitleOutlineThickness);
    }

    get subtitleBackgroundColor() {
        return localStorage.getItem(subtitleBackgroundColorKey) || defaultSubtitleBackgroundColor;
    }

    set subtitleBackgroundColor(subtitleBackgroundColor) {
        localStorage.setItem(subtitleBackgroundColorKey, subtitleBackgroundColor);
    }

    get subtitleBackgroundOpacity() {
        return localStorage.getItem(subtitleBackgroundOpacityKey) || defaultSubtitleBackgroundOpacity;
    }

    set subtitleBackgroundOpacity(subtitleBackgroundOpacity) {
        localStorage.setItem(subtitleBackgroundOpacityKey, subtitleBackgroundOpacity);
    }

    get volume() {
        return localStorage.getItem(volumeKey) || defaultVolume;
    }

    set volume(volume) {
        localStorage.setItem(volumeKey, volume);
    }
}