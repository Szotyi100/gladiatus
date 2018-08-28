'use strict';

class CareerPage {
    constructor() {
        this.desktop = element(by.css('.section-ui.section--padding-normal.section--hide-on-mobile'));
        this.searchForm = this.desktop.element(by.css('.job-search__area'));
        this.logo = element(by.css('.header__logo'));
        this.searchButton = this.searchForm.element(by.css('.career-apply-box-desktop button[type="Submit"].job-search-button'));

        this.locationFilterBox = this.searchForm.element(by.css('div[id*="select-box-location"]'));
        this.selectedLocation = element(by.id('select-box-location-select-container'));
        this.getCountryOfLocation = country => element(by.css(`li[aria-label="${country}"]`));
        this.getCityOfLocation = city => element(by.cssContainingText('.dropdown-cities .options > .option', city));

        this.departmentSelect = this.searchForm.element(by.css('.multi-select-department'));
        this.getDepartmentCheckbox = department => this.departmentSelect.element(by.cssContainingText('ul li span.blue-checkbox-label', department));
        this.selectedDepartments = this.departmentSelect.all(by.css('.selected-items .filter-tag'));

        const SEARCH_RESULT_ITEM_SELECTOR = '.search-result-list .search-result-item';
        this.searchResultItems = element.all(by.css(SEARCH_RESULT_ITEM_SELECTOR));
        this.nameOfPosition = position => position.element(by.css('.position-name'));
        this.departmentOfPosition = position => position.element(by.css('.department'));
        this.locationOfPosition = position => position.element(by.css('.location'));
        this.applyLinkOfPosition = position => position.element(by.css('.button-apply a'));

        this.getResultByPosition = name => this.searchResultItems.filter(item => {
            return this.nameOfPosition(item).getText().then(position => position.trim() === name);
        }).first();

        this.jobDescription = element(by.css('.recruiting-details-description-header'));
    }

    hasClass(el, c) {
        return el.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(c) !== -1;
        });
    }

    load() {
        browser.get('https://www.epam.com/careers');
        return browser.wait(this.logo.isDisplayed(), GLOBAL_TIMEOUT);
    }

    openLocationDropDown() {
        return this.locationFilterBox.click();
    }

    selectCity(city) {
        return this.getCityOfLocation(city).click();
    }


    selectCountryFromDropdown(country){
        return this.openLocationDropDown().then(() => {
            return this.isExpanded(country).then((expanded) => {
                if (!expanded){
                    return this.selectCountry(country);
                }
            })
        })
    }

    selectCountry(country) {
        return this.getCountryOfLocation(country).click();
    }

    isExpanded(country) {
        return this.hasClass(this.getCountryOfLocation(country), 'dropdown-cities');
    }


    selectCityInCountry(country, city) {

        return this.openLocationDropDown().then(() => {
            browser.sleep(500);
            return this.isExpanded(country).then(expanded => {
                console.log("isExpanded: ", expanded);
                if (expanded) {       
                    browser.sleep(500);             
                    return this.selectCity(city);
                }
                browser.sleep(1000);
                return this.selectCountry(country).then(() => {
                    browser.sleep(1000);
                    return this.selectCity(city);
                })
            })
        })

        /** 
          const countryOption = this.getCountryOfLocation(country);
          countryOption.isDisplayed().then(displayed => {
              if (!displayed) {
                  this.locationFilterBox.click();
              }
          }, e => this.locationFilterBox.click());
          const cityOption = this.getCityOfLocation(city);
          cityOption.isDisplayed().then(displayed => {
              if (!displayed) {
                  browser.actions().mouseMove(cityOption).perform();
                  console.log("HERE")
                  countryOption.click();
              }
          }, e => countryOption.click());
          return cityOption.click();
  
          */
    }

    toggleDepartment(department) {
        const departmentCheckbox = this.getDepartmentCheckbox(department);
        departmentCheckbox.isDisplayed().then(displayed => {
            if (!displayed) {
                this.departmentSelect.click();
            }
        }, e => this.departmentSelect.click());
        browser.wait(ec.visibilityOf(departmentCheckbox), GLOBAL_TIMEOUT);
        return departmentCheckbox.click();
    }

    getSelectedCity() {
        return this.selectedLocation.getText();
    }

    getSearchResultCount() {
        return this.searchResultItems.count();
    }

    search() {
        this.searchButton.click();
        return browser.wait(() => {
            return this.searchResultItems.count().then(n => n > 0);
        }, GLOBAL_TIMEOUT);
    }

    applyForPosition(position) {
        this.applyLinkOfPosition(position).click();
        return browser.wait(ec.visibilityOf(this.jobDescription), GLOBAL_TIMEOUT);
    }
}

module.exports = CareerPage;