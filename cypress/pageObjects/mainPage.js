import CyrillicToTranslit from 'cyrillic-to-translit-js';
const cyrillicTiTranslit = new CyrillicToTranslit(); // библиотека для проверки транслитерации

class MainPage {
    // elements
    getGEOModalWindow = () => cy.get('div[class*="CitySelectionConfWrapper"]');
    getHeaderSearch = () => cy.get('div[class*=HeaderWrapper] [class*="HeaderSearch"]');
    getSearchPopupInput = () => cy.get('[class*="SearchPopupInputWrapper"] input');

    // methods
    clickConfirmGEO = () => this.getGEOModalWindow().find('button').first().click({ force: true });

    clickHeaderSearch = () => this.getHeaderSearch().click();

    typeSearchPopupInput = (text) => this.getSearchPopupInput().type(text);

    checkTransliteration = (responseData, testData, language) => {
        if(language === 'RU'){
            let resultSearch = responseData.response.body.products.items[0].title;
            let latinicaTocyrillica = cyrillicTiTranslit.reverse(testData.transliterationExampleRU);
            expect(resultSearch).to.includes(latinicaTocyrillica);
        } else if (language === 'EN'){
            let resultSearch = responseData.response.body.products.items[0].title;
            let cyrillicaTolatinica = cyrillicTiTranslit.transform(testData.transliterationExampleEN);
            expect(resultSearch).to.includes(cyrillicaTolatinica);
        }
    };

    checkUniqOutputSearch = (responseData) => {
        let listArticle = responseData.response.body.products.items;
        listArticle = listArticle.map(el => el.article);
        let uniqArticle = [...new Set(listArticle)];
        expect(listArticle.length).to.have.eql(uniqArticle.length);
    };

    checkCorrectSearchOutput = (responseData, testData) => {
        /*
    «Поиск производится по вхождению подстроки в значения следующих параметров товаров:

    *Название.
    *Артикул.
    *Описание.

    Вывод результатов поиска — в порядке релевантности:
    Первой выводится группа результатов с полным совпадением введенной подстроки. Порядок результатов в группе — случайный.
    Следующей выводится группа результатов, содержащих все введенные слова, независимо от их порядка. Порядок результатов в группе — по количеству слов, порядок которых совпадает с порядком в искомой подстроке.
    Следующей выводится группа результатов, содержащих по крайней мере одно из введенных слов. Порядок результатов в группе — по количеству найденных слов.
//
    Именно описание товара не нашел в ответе от сервера (только article и название).
    Совершу проверку по article. + подстрока названия товара (Смысл проверки в том, что позиция товара должна соответствовать набранным очкам).
    Создам свою систему оценивания соответствия:
    Если артикул ИЛИ название товара совпадает полностью, то данному товару я буду начислять 10 очков.
    Если артикул ИЛИ навание товара является подстрокой, то начисляю 2 очка.
    Очки могут суммириваться.
    Примеры: 
    1.Входные данные "2611 ор" 
    => Если товар будет содержать в своем названии /ор/ и в артикуле /2611/ = 2 + 2 = 4 очка  ("Витрина для м/ор/оженого ISA HORIZON 120 H117" c артикулом "3/2611/").
    => Если товар будет иметь полное совпадение с артикулом 2611 и содержать в названии /ор/ = 10 + 2 = 12 очков ("М/ОР/ОЗИЛЬНЫЙ ЛАРЬ СНЕЖ МЛК 350" с артикулом /2611/).
    2.Входные данные "350 ороз"
    => Если товар будет содержать в своем названии /ороз/ и /350/ = 2 очка ("М/ОРОЗ/ИЛЬНЫЙ ЛАРЬ СНЕЖ МЛК 350" с артикулом 2611).
    => Если товар будет содержать в своем названии /350/ и /350/ в артикуле = 2 + 2 = 4 очка ("МОРОЗИЛЬНЫЙ СНЕЖ ДЛК /350/" с артикулом 2/350/) такого товара нет. Абстрактный пример.
    */

        let resultSearch = responseData.response.body.products.items;
        let correctPosition = {};
        resultSearch.forEach(el => {
            if (el.id === testData.correctSearchOutput.article && el.title === testData.correctSearchOutput.productName) {
                el['score'] = 20;
            } else if (el.id === testData.correctSearchOutput.article || el.title === testData.correctSearchOutput.productName) {
                el['score'] = 10;
                if ((!(el.id === testData.correctSearchOutput.article) && el.id.toString().includes(testData.correctSearchOutput.article)) || (!(el.title === testData.correctSearchOutput.title) && el.title.includes(testData.correctSearchOutput.productName))) {
                    el['score'] += 2;
                }
            } else if ((el.id.toString().includes(testData.correctSearchOutput.article) && el.title.includes(testData.correctSearchOutput.productName)) || (el.id.toString().includes(testData.correctSearchOutput.article) && el.title.includes(testData.correctSearchOutput.article))) {
                el['score'] = 4;
            } else if (el.title.includes(testData.correctSearchOutput.productName) || el.id.toString().includes(testData.correctSearchOutput.article) || el.title.includes(testData.correctSearchOutput.article)) {
                el['score'] = 2;
            }
        });
        resultSearch.forEach(el => correctPosition[el.title] = el.score);
        resultSearch = resultSearch.map((el, i) => [el.title, i]); // Получаю массив : [["Название товара", его позиция в результате поиска], ["Название товара", его позиция в результате поиска]... ]
        cy.log(resultSearch);
        cy.log(correctPosition);
        correctPosition = Object.keys(correctPosition).sort((a, b) => correctPosition[b] - correctPosition[a]).map((el, i) => [el, i]); // =>
        // Сортирую по значению, где значение - результат набранных очков. В порядке убывания, тем самым проверяя релевантность вывода результатов поиска.
        // Если позиции элементов в массивах равны, то поиск отрабатывает согласно требованиям.
        expect(correctPosition).to.deep.equal(resultSearch);
    };

};
export default MainPage;