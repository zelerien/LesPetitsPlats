import { normalizeString } from '../utils/normalizeString.js';
import Tag from './Tag.js';
import { filterRecipesByTags } from '../utils/filterRecipesByTag.js';
import { selectedTags } from '../pages/home.js';
import { currentRecipes } from '../pages/home.js';

export default class Dropdown {
    constructor(name, items) {
        this.name = name;
        this.items = items;
        this.filteredItems = [];
        this.itemList = null;
    }

    createDropdown() {
        const dropdownContent = `
                <div class="dropdown"> 
                    <button class="dropdown_btn" type="button">
                        <span>${this.name}</span>
                        <span class="fa-solid fa-chevron-down" aria-hidden="true"></span>
                    </button>

                    <div class="dropdown_content">
                        <div>
                            <input tabindex="-1" type="text" id="search-${this.name}" maxlength="12">
                            <button tabindex="-1"></button>
                            <label for="search-${this.name}" aria-label="Search by ${this.name}"></label>
                        </div>
                        <ul class="dropdown_content_list">
                            ${this.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>                          
        `;
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.setAttribute('class', 'dropdown_wrapper');
        dropdownWrapper.innerHTML = dropdownContent;

        const inputElement = dropdownWrapper.querySelector(`#search-${this.name}`);
        this.itemList = dropdownWrapper.querySelectorAll('.dropdown_content_list li');

        inputElement.addEventListener('input', () => {
            this.search(normalizeString(inputElement.value));
            this.toggleDeleteBtn(inputElement);
        });

        this.tagHandler(inputElement);

        return dropdownWrapper;
    }

    updateItems(filteredItems, _inputValue, match) {
        this.filteredItems = filteredItems;

        this.itemList.forEach(item => item.style.display = 'none');

        let items = match ? match : this.filteredItems;

        items.forEach(itemText => {
            const itemElement = [...this.itemList].find(item => normalizeString(item.textContent) === normalizeString(itemText));
            if (itemElement)
                itemElement.style.display = 'block';
        });
    }

    search(inputValue) {
        const itemsToSearch = !this.filteredItems.length ? this.items : this.filteredItems;

        const match = itemsToSearch.filter(item => {
            const normalizedItem = normalizeString(item);
            return normalizedItem.includes(inputValue);
        });

        this.updateItems(this.filteredItems, inputValue, match)
    }

    resetItemList() {
        this.itemList.forEach(item => item.style.display = 'block');
        this.filteredItems = [];
    }

    toggleDeleteBtn(inputElement) {
        const btnDelete = inputElement.nextElementSibling;
        const inputValue = inputElement.value;
        inputValue.length > 0 ? btnDelete.style.display = 'block' : btnDelete.style.display = 'none';

        btnDelete.addEventListener('click', () => {
            inputElement.value = '';
            btnDelete.style.display = 'none';

            const itemsToReset = !this.filteredItems.length ? this.items : this.filteredItems;
            this.updateItems(itemsToReset, inputValue, null);
        });
    }

    tagHandler(inputElement) {
        this.itemList.forEach(item => {
            item.addEventListener('click', () => {
                this.addTag(item.textContent)
                inputElement.value = '';
            });
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.addTag(item.textContent)
                inputElement.value = '';
            });
        });
    }

    addTag(tagText) {
        if (!selectedTags.includes(tagText)) {
            const tag = new Tag(tagText);
            tag.createTag();
            selectedTags.push(tagText);
        }
        filterRecipesByTags(currentRecipes, selectedTags);
    }
}
