// BUDGET CONTROLLER
var budgetController = (function () {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value; 
        });
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {
            
            var newItem, ID;
            
            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }
            
            // create new item based on either 'income' or 'expense'
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // push new items to data
            data.allItems[type].push(newItem);
            
            // return new item
            return newItem;
            
        },
        
        deleteItem: function(type, id) {
          
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate % of income we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);   // expense = 100, income =200, then expenses % = 50%
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
                
            }  
        },
        
        testing: function() {
            console.log(data);
        }
        
    }
})();




// UI CONTROLLER
var UIController = (function () {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    var formatNumber = function(num, type) {
            /* 
                + or - before number
                exactly 2 decimal points
                comma separating the thousands
                
                Ex: 1234.2323 ---> +1,234.23
                
            */  
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3) 
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    nodeListForEach = function(list, callback) {
                
        for( i = 0; i < list.length; i++){
            callback(list[i], i);
        }
                
    };
    
    return {
        getInput: function(){
            
            return{
                type: document.querySelector(DOMstrings.inputType).value, // will be either 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
            
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            if(type === 'inc'){
            // create html string with placeholder text
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>' ;
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' ;
            }
            // replace placeholder text with actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            
            // insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },
        
        deleteListItem: function(selectorID){
            
            var el;
            el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el);  
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription+ ','+ DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = ""; 
            });
            fieldsArr[0].focus();
            
        },
        
        displayBudget: function(obj) {
            
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },
        
        displayPercentages: function(percentages) {
            var fields, nodeListForEach;
            
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })
        },
        
        displayMonth: function () {
            var now, year, month;
            
            now = new Date();
            
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent =  months[month] + ' ' +year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription +','+ DOMstrings.inputValue);
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        getDOMstrings: function(){
            return DOMstrings;    
        }    
    };

})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl) {
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
    
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if( event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // 1. calculate budget
        budgetCtrl.calculateBudget();
        
        // 5. return the budget
        var budget = budgetCtrl.getBudget();
        
        // 6. display budget on UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        
        // calculate percentages
        budgetCtrl.calculatePercentages();
        
        // read % from the budget ctrl
        var percentages = budgetCtrl.getPercentages();
        
        // update UI with new %
        UICtrl.displayPercentages(percentages);
    }
    
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        // 1. get the field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget(); 
            
            // 6. calculate and update %'s
            updatePercentages();
        }
        
        
    };
    
    var ctrlDeleteItem = function(event) {
        
        var itemId, splitId, type, id;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
        }
        
        // delete item from data structure
        budgetCtrl.deleteItem(type, id);
        
        // delete item from the UI
        UICtrl.deleteListItem(itemId);
        
        // calculate and update budget
        updateBudget();
        
        // calculate and update %'s
        updatePercentages();

        
    }
    
    return {
        init: function() {
            console.log('app started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1 
                
            });
            setupEventListeners();
        }
    };
    
    
})(budgetController,UIController);


controller.init();
