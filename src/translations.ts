import { en_GB } from './languages/en_GB';
import { timeFormatLocale } from 'd3';

export const translations = {
    'en_GB': en_GB,
}

export const time_en_GB = timeFormatLocale({
    dateTime: "%a %b %e %Y %X",
    date: "%d:%m:%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Oktober', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
});

export const time_de_DE = timeFormatLocale({
    dateTime: "%a %e %b %Y %X",
    date: "%d:%m:%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    shortDays: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
});