import { selectAll, select, format, formatLocale, timeFormatLocale } from 'd3';
import { translations, time_en_GB, time_de_DE } from './translations';


export default function translate(language?: string) {
    if (language != null) {
        select('html').attr('lang', language);
    } else {
        language = select('html').attr('lang');
        if (language == null) {
            language = 'en_GB';
        }
    }
    const fallback = translations['en_GB'];
    const languagepack = translations[language];
    const getText = (d) => {
        let text = null;
        if (languagepack != null) {
            text = languagepack[d];
        }
        if (text == null) {
            text = fallback[d];
        }
        return text;
    };
    const translatableText = selectAll('[translate="yes"]:not(input)');
    translatableText
        .datum(function () {return select(this).attr('data-translation');})
        .text(getText);
    const translatableInput = selectAll('input[translate="yes"]');
    translatableInput
        .datum(function () {return select(this).attr('data-translation');})
        .attr('placeholder', getText);
}

export const formatCurrency = formatLocale({currency: ['', '€'], decimal: ',', thousands: "'", grouping: [3]}).format('-$0.2f');

export function getTimeFormat() {
    const language = select('html').attr('lang');
    let timeLocale;
    if (language.startsWith('en')) {
        timeLocale = time_en_GB;
    } else if (language.startsWith('de')) {
        timeLocale = time_de_DE;
    } else {
        timeLocale = time_en_GB;
    }
    return timeLocale;
}