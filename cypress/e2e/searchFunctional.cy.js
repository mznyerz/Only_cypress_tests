/// <reference types="cypress"/>


import MainPage from '../pageObjects/mainPage.js';
import changeLayoutKeyboard from '../fixtures/functions.js';

const mainPage = new MainPage();

describe('Тест сьют функционала поиска', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.fixture('testData').as('data');
    });


    it('AT_01.01 | Проверка автоматического распознавания транслитерации и приведения поискового запроса к нативному языку (RU)', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.transliterationExampleRU)
        cy.wait('@responseData').then(data => {
            mainPage.checkTransliteration(data, this.data, 'RU');
        });
    });

    it('AT_01.02 | Проверка автоматического распознавания транслитерации и приведения поискового запроса к нативному языку (EN)', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.transliterationExampleEN);
        cy.wait('@responseData').then(data => {
            mainPage.checkTransliteration(data, this.data, 'EN');
        });
    });


    it('AT_01.03 | Проверка корретности результатов поиска', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.correctSearchOutput.inputText);
        cy.wait('@responseData').then(data => {
            mainPage.checkCorrectSearchOutput(data, this.data);
        });
    });

    it('AT_01.04 | Проверка результатов поиска на отсутствие дублирования товаров', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.correctSearchOutput.inputText);
        cy.wait('@responseData').then(data => {
            mainPage.checkUniqOutputSearch(data);
        });
    });

    it('AT_01.05 | Проверка автозамены неверно выбранной раскладки (RU-EN)', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.layoutKeyboardExampleRU)
        cy.wait('@responseData').then(data => {
            let changeLayoutKeyboardText = changeLayoutKeyboard(this.data.layoutKeyboardExampleRU, 'RU')
            let searchResult = data.response.body.products.items[0].title;
            expect(searchResult).to.includes(changeLayoutKeyboardText);
        });
    });

    it('AT_01.06 | Проверка автозамены неверно выбранной раскладки (EN-RU)', function(){
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.layoutKeyboardExampleEN)
        cy.wait('@responseData').then(data => {
            let changeLayoutKeyboardText = changeLayoutKeyboard(this.data.layoutKeyboardExampleEN, 'EN')
            let searchResult = data.response.body.products.items[0].title;
            expect(searchResult).to.includes(changeLayoutKeyboardText);
        });
    });

    it('AT_01.07 | Проверка автоматического исправления слова, содержащего не более 3 ошибочных символов.', function () {
        mainPage.getGEOModalWindow().should('be.visible');
        mainPage.clickConfirmGEO();
        mainPage.clickHeaderSearch();
        cy.intercept(`/api/products/search?query=*%*`).as('responseData');
        mainPage.typeSearchPopupInput(this.data.spellingErrorsExample.inputText)
        cy.wait('@responseData').then(data => {
            let searchResult = data.response.body.products.items[0].title;
            expect(searchResult).to.includes(this.data.spellingErrorsExample["Устеглвка компреоола"]); // Сделано по 3 ошибочных символа в каждом слове.
        });
    });
    
});