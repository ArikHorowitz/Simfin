document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('screen');
    // Initial more specific selectors (can be enhanced with IDs in HTML)
    // const numberButtons = document.querySelectorAll('.buttons button:not(.operator):not(#equals):not(#clear):not(#all-clear)...');
    // const operatorButtons = document.querySelectorAll('.buttons button.operator');
    // const equalsButton = document.getElementById('equals');
    // const clearButton = document.getElementById('clear');
    // const allClearButton = document.getElementById('all-clear');

    // --- Get DOM Elements by ID ---
    // Display element
    // const display = document.getElementById('screen'); // Already defined at the top

    // Number buttons (0-9, ., 00)
    const btn0 = document.getElementById('btn-0');
    const btn1 = document.getElementById('btn-1');
    const btn2 = document.getElementById('btn-2');
    const btn3 = document.getElementById('btn-3');
    const btn4 = document.getElementById('btn-4');
    const btn5 = document.getElementById('btn-5');
    const btn6 = document.getElementById('btn-6');
    const btn7 = document.getElementById('btn-7');
    const btn8 = document.getElementById('btn-8');
    const btn9 = document.getElementById('btn-9');
    const btnDot = document.getElementById('btn-dot');
    const btn00 = document.getElementById('btn-00');

    const actualNumberButtons = [btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9, btnDot, btn00].filter(Boolean);

    // Operator buttons (+, -, *, /)
    const btnPlus = document.getElementById('btn-plus');
    const btnMinus = document.getElementById('btn-minus');
    const btnMultiply = document.getElementById('btn-multiply');
    const btnDivide = document.getElementById('btn-divide');
    const actualOperatorButtons = [btnPlus, btnMinus, btnMultiply, btnDivide].filter(Boolean);

    // Equals button (=)
    const actualEqualsButton = document.getElementById('btn-equals');

    // Clear (C) and All Clear (AC) buttons
    const actualClearButton = document.getElementById('btn-c');
    const actualAllClearButton = document.getElementById('btn-ac');
    const btnPercent = document.getElementById('btn-percent');

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

    // --- Implement Percentage (%) ---
    if (btnPercent) {
        btnPercent.addEventListener('click', () => {
            if (currentInput === 'Error') return;

            const currentValue = parseFloat(currentInput);
            if (isNaN(currentValue)) return;

            let result;
            if (operator !== null && firstOperand !== null && !shouldResetDisplay) {
                // Case: part of an operation like 100 * 5%
                // Here, currentValue is the second operand for the percentage calculation
                // The percentage is applied to firstOperand based on currentValue
                // e.g. 100 + 5% (of 100) means 100 + (100 * 5 / 100) = 100 + 5 = 105
                // e.g. 100 * 5% (of 100) means 100 * (5 / 100) = 100 * 0.05 = 5
                // The problem statement implies (firstOperand * currentValue) / 100 which is firstOperand * (currentValue/100)
                // This is consistent with Casio behavior for A * B % = (A*B)/100
                result = (firstOperand * currentValue) / 100;

            } else {
                // Case: standalone percentage like 5%
                // This means currentValue / 100
                result = currentValue / 100;
            }
            
            currentInput = result.toString();
            // After % is pressed, the result is displayed. 
            // It typically finalizes this part of the calculation.
            // For example, 100 + 5 % results in 5 (5% of 100). Then if you press =, it should perform 100 + 5.
            // This behavior can be complex. For now, let's assume % completes the immediate percentage operation
            // and the result becomes the new currentInput.
            // The subtask states: "operator and firstOperand should be reset ... if the percentage was applied directly"
            // "If it was part of an operation... for now, let's assume it finalizes the segment, so operator and firstOperand are cleared"
            
            // If it was part of a calculation like 100 * 5 %, the result (5) is now in currentInput.
            // This result (5) should become the new firstOperand if a new operator is pressed,
            // or it's the final result if '=' is pressed (or another number is typed).
            // The current interpretation based on subtask instructions is that it finalizes this segment.
            // For simplicity, as per subtask: clear operator and firstOperand.
            firstOperand = null; 
            operator = null; 
            shouldResetDisplay = true; // Next number input should clear display.
            updateDisplay();
        });
    }

    // --- Implement Square Root (√) ---
    const btnSqrt = document.getElementById('btn-sqrt');
    if (btnSqrt) {
        btnSqrt.addEventListener('click', () => {
            if (currentInput === 'Error') return;

            const currentValue = parseFloat(currentInput);
            if (isNaN(currentValue)) { // Should not happen if input is controlled, but good check
                currentInput = 'Error';
                operator = null;
                firstOperand = null;
                shouldResetDisplay = true;
                updateDisplay();
                return;
            }

            if (currentValue < 0) {
                currentInput = 'Error';
                operator = null;
                firstOperand = null;
            } else {
                const result = Math.sqrt(currentValue);
                currentInput = result.toString();
            }
            
            shouldResetDisplay = true;
            updateDisplay();
        });
    }

    // --- Implement Sign Change (+/-) ---
    const btnSign = document.getElementById('btn-sign');
    if (btnSign) {
        btnSign.addEventListener('click', () => {
            if (currentInput === 'Error' || currentInput === '') return;

            const currentValue = parseFloat(currentInput);
            if (isNaN(currentValue)) { // Should not happen if input is controlled
                return; 
            }

            if (currentValue === 0) {
                // Ensure currentInput remains "0", not "-0"
                currentInput = "0";
            } else {
                currentInput = (currentValue * -1).toString();
            }
            
            // shouldResetDisplay remains as it was. 
            // If a number was being typed, it's still being typed.
            // If a result was displayed, it's now negated, and next number will clear it if shouldResetDisplay was true.
            // The subtask states: "shouldResetDisplay should generally remain false..."
            // For simplicity, let's assume it does not change shouldResetDisplay's state.
            updateDisplay();
        });
    }
});

// --- Manual Test Cases ---

// Percentage (%):
// 1. Basic percentage of a number: 200 % => Expected: 2
// 2. Percentage in an addition: 100 + 10 % => Expected: 110 (10% of 100 is 10, 100+10 = 110)
// 3. Percentage in a subtraction: 100 - 5 % => Expected: 95 (5% of 100 is 5, 100-5 = 95)
// 4. Percentage in a multiplication: 50 * 20 % => Expected: 10 (50 * 0.20 = 10)
// 5. Percentage in a division: 200 / 50 % => Expected: 400 (200 / 0.5 = 400)
// 6. Chained percentage: 100 + 10 % + 10 % => Expected: 121 (110 + 10% of 110 = 121)
// 7. Zero value: 0 % => Expected: 0
// 8. Percentage of zero: 100 * 0 % => Expected: 0

// Square Root (√):
// 1. Perfect square: 9 √ => Expected: 3
// 2. Non-perfect square: 2 √ => Expected: 1.41421356...
// 3. Zero: 0 √ => Expected: 0
// 4. Negative number: -4 √ => Expected: Error
// 5. Result of an operation: 5 + 4 = √ => Expected: 3
// 6. Square root then operation: 9 √ + 1 = => Expected: 4

// Sign Change (+/-):
// 1. Positive to negative: 5 +/- => Expected: -5
// 2. Negative to positive: -23 +/- => Expected: 23
// 3. Zero: 0 +/- => Expected: 0
// 4. After an operation: 10 - 4 = +/- => Expected: -6
// 5. Before an operation: 5 +/- * 2 = => Expected: -10
// 6. Multiple times: 7 +/- +/- +/- => Expected: -7
