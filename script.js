document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('screen');
    // Initial more specific selectors (can be enhanced with IDs in HTML)
    // const numberButtons = document.querySelectorAll('.buttons button:not(.operator):not(#equals):not(#clear):not(#all-clear)...');
    // const operatorButtons = document.querySelectorAll('.buttons button.operator');
    // const equalsButton = document.getElementById('equals');
    // const clearButton = document.getElementById('clear');
    // const allClearButton = document.getElementById('all-clear');

    // Using getButtonByText for now as HTML doesn't have specific IDs for all buttons yet
    const buttons = Array.from(document.querySelectorAll('.buttons button'));

    function getButtonByText(text) {
        return buttons.find(button => button.textContent.trim() === text);
    }

    // --- Get DOM Elements (using the text content for now) ---
    // Display element is already 'display'

    // Number buttons (0-9, ., 00)
    const btn0 = getButtonByText('0');
    const btn1 = getButtonByText('1');
    const btn2 = getButtonByText('2');
    const btn3 = getButtonByText('3');
    const btn4 = getButtonByText('4');
    const btn5 = getButtonByText('5');
    const btn6 = getButtonByText('6');
    const btn7 = getButtonByText('7');
    const btn8 = getButtonByText('8');
    const btn9 = getButtonByText('9');
    const btnDot = getButtonByText('.');
    const btn00 = getButtonByText('00');

    const actualNumberButtons = [btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9, btnDot, btn00].filter(Boolean);

    // Operator buttons (+, -, *, /)
    const btnPlus = getButtonByText('+');
    const btnMinus = getButtonByText('-');
    const btnMultiply = getButtonByText('*');
    const btnDivide = getButtonByText('/');
    const actualOperatorButtons = [btnPlus, btnMinus, btnMultiply, btnDivide].filter(Boolean);

    // Equals button (=)
    const actualEqualsButton = getButtonByText('=');

    // Clear (C) and All Clear (AC) buttons
    const actualClearButton = getButtonByText('C');
    const actualAllClearButton = getButtonByText('AC');

    // --- State Variables ---
    let currentInput = '0';
    let operator = null;
    let firstOperand = null;
    let shouldResetDisplay = false;

    // --- Update Display Function ---
    function updateDisplay() {
        display.value = currentInput;
    }
    updateDisplay(); // Initialize display

    // --- Handle Number Button Clicks ---
    actualNumberButtons.forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            const number = button.textContent.trim();

            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }

            if (currentInput === '0' && number !== '.' && number !== '00') {
                currentInput = number;
            } else if (currentInput === '0' && number === '00') {
                // Stays '0'
            } else if (number === '.' && currentInput.includes('.')) {
                return; // Prevent multiple decimal points
            } else if (number === '00') {
                if (currentInput === '0' || currentInput === '') {
                    currentInput = '0';
                } else {
                    currentInput += '00';
                }
            } else {
                currentInput += number;
            }
            updateDisplay();
        });
    });

    // --- Handle Operator Button Clicks ---
    actualOperatorButtons.forEach(button => {
        if (!button) return;
        button.addEventListener('click', () => {
            const selectedOperator = button.textContent.trim();

            // If an operator is pressed and there's already a first operand and a current input (second operand)
            // then calculate the result before setting the new operator.
            if (operator !== null && firstOperand !== null && currentInput !== '' && !shouldResetDisplay) {
                calculate(); // This will update currentInput with the result and set it as firstOperand
            }
            
            // Set the first operand if currentInput is available
            // This uses the current number on screen or the result of a previous calculation
            if (currentInput !== '') {
                firstOperand = parseFloat(currentInput);
            } else if (firstOperand === null) { // If no current input and no first operand (e.g. AC -> +)
                firstOperand = 0;
            }
            // else, firstOperand remains from previous calculation if currentInput is empty (e.g. after an operator)

            operator = selectedOperator;
            shouldResetDisplay = true; // Next number input should clear the display (which shows firstOperand or result)
        });
    });

    // --- Handle Equals Button Click ---
    if (actualEqualsButton) {
        actualEqualsButton.addEventListener('click', () => {
            if (operator && firstOperand !== null && currentInput !== '') {
                calculate();
                operator = null; // Reset operator after calculation. Result becomes firstOperand for next op if any.
                // shouldResetDisplay is set to true by calculate()
            }
        });
    }

    // --- Calculation Logic ---
    function calculate() {
        if (operator === null || firstOperand === null || (currentInput === '' && !shouldResetDisplay) ) {
            // (currentInput === '' && !shouldResetDisplay) means we don't have a valid second operand typed out
            // If shouldResetDisplay is true, currentInput might be showing firstOperand, but that's not the second operand.
            return;
        }
        // If shouldResetDisplay is true here, it implies an operator was just pressed,
        // and currentInput still holds the firstOperand. We need the actual second operand.
        // However, this case is handled by the equals button logic and operator button logic more directly.
        // The main check is that firstOperand, operator, and a valid secondOperand (currentInput) are present.

        const secondOperand = parseFloat(currentInput);
        let result = 0;

        switch (operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '*':
                result = firstOperand * secondOperand;
                break;
            case '/':
                if (secondOperand === 0) {
                    currentInput = 'Error';
                    updateDisplay();
                    operator = null;
                    firstOperand = null; // Or keep firstOperand for subsequent calculations? Typically reset.
                    shouldResetDisplay = true;
                    return;
                }
                result = firstOperand / secondOperand;
                break;
            default:
                return;
        }

        currentInput = result.toString();
        firstOperand = result; // The result becomes the new first operand
        // operator remains for chained operations until equals or AC, or new operator overwrites
        shouldResetDisplay = true; // Next number input will clear the result from display
        updateDisplay();
    }

    // --- Implement Clear (C) and All Clear (AC) ---
    if (actualClearButton) {
        actualClearButton.addEventListener('click', () => {
            // If a result is displayed (shouldResetDisplay is true) and an operation was performed (firstOperand is not null),
            // 'C' often acts like 'AC' or clears the result to '0' to start a new calculation with '0'.
            if (shouldResetDisplay && firstOperand !== null && operator !== null) {
                // This means an operator was just pressed, currentInput holds firstOperand.
                // 'C' should clear the upcoming second operand, so set currentInput to '0'.
                currentInput = '0'; 
                // Keep firstOperand and operator. shouldResetDisplay is already true.
            } else if (shouldResetDisplay && firstOperand !== null && operator === null){
                // This means equals was pressed, result is shown. C acts like AC.
                 allClear();
            }
            else {
                // Default 'C' behavior: clear current entry to '0'.
                currentInput = '0';
                // If C is pressed while typing the first number, firstOperand and operator are still null.
                // If C is pressed while typing the second number (operator is set, firstOperand is set, shouldResetDisplay is false),
                // it clears currentInput (the second number) to '0'. The operation remains pending.
            }
            updateDisplay();
        });
    }

    if (actualAllClearButton) {
        actualAllClearButton.addEventListener('click', allClear);
    }

    function allClear() {
        currentInput = '0';
        operator = null;
        firstOperand = null;
        shouldResetDisplay = false;
        updateDisplay();
    }
});
