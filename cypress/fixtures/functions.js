
export default function changeLayoutKeyboard(text, language) {
    let replacer = {
        "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
        "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "a": "ф", "s": "ы",
        "d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д",
        ";": "ж", "'": "э", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и",
        "n": "т", "m": "ь", ",": "б", ".": "ю", "/": ".", " ": " ",
    };
    if(language === 'RU'){
        return text.split('').map(el => !replacer[el] ? replacer[el.toLowerCase()].toUpperCase() : replacer[el]).join('').trim();
    }else if (language === 'EN'){
        replacer = Object.fromEntries(Object.entries(replacer).map(([key, value]) => [value, key]));
        return text.split('').map(el => !replacer[el] ? replacer[el.toLowerCase()].toUpperCase() : replacer[el]).join('').trim();
    };

};
