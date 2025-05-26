// script.js

document.addEventListener('DOMContentLoaded', () => {
  // DOM Element Selection
  const displayElement = document.getElementById('display');
  const buttons = document.querySelectorAll('.calculator-buttons button');

  // TVM Modal Elements
  const tvmModal = document.getElementById('tvm-modal');
  const tvmCloseButton = document.getElementById('tvm-close-button');
  const tvmCalculateButton = document.getElementById('tvm-calculate-button');
  const tvmPvInput = document.getElementById('tvm-pv');
  const tvmRateInput = document.getElementById('tvm-rate');
  const tvmPeriodsInput = document.getElementById('tvm-periods');
  const tvmTimeInput = document.getElementById('tvm-time');

  // AMRT Modal Elements
  const amrtModal = document.getElementById('amrt-modal');
  const amrtCloseButton = document.getElementById('amrt-close-button');
  const amrtCalculateButton = document.getElementById('amrt-calculate-button');
  const amrtPrincipalInput = document.getElementById('amrt-principal');
  const amrtRateInput = document.getElementById('amrt-rate');
  const amrtPaymentsInput = document.getElementById('amrt-payments');

  // SMPL Modal Elements
  const smplModal = document.getElementById('smpl-modal');
  const smplCloseButton = document.getElementById('smpl-close-button');
  const smplCalculateButton = document.getElementById('smpl-calculate-button');
  const smplPrincipalInput = document.getElementById('smpl-principal');
  const smplRateInput = document.getElementById('smpl-rate');
  const smplTimeInput = document.getElementById('smpl-time');

  // CSM Modal Elements
  const csmModal = document.getElementById('csm-modal');
  const csmCloseButton = document.getElementById('csm-close-button');
  const csmCalculateButton = document.getElementById('csm-calculate-button');
  const csmCostInput = document.getElementById('csm-cost');
  const csmSellInput = document.getElementById('csm-sell');
  const csmMarInput = document.getElementById('csm-mar');
  const csmErrorP = document.getElementById('csm-error');


  // Variables for Calculator State
  let currentInput = '0';
  let operator = null;
  let previousInput = null;
  let isCalculatorOff = false;
  
  // Memory State Variables
  let memoryValue = 0;
  let mrcPressedOnce = false;

  // SHIFT and MODE State Variables
  let isShiftActive = false;
  const modes = ['NORMAL', 'STAT', 'CMPLX', 'FIN']; // Example modes
  let currentModeIndex = 0;
  let currentMode = modes[currentModeIndex];


  // Helper Function updateDisplay()
  function updateDisplay() {
    const maxDisplayLength = 15; 
    if (currentInput.length > maxDisplayLength) {
        const num = parseFloat(currentInput);
        if (!isNaN(num)) {
            displayElement.textContent = num.toExponential(maxDisplayLength - 7); 
        } else {
            displayElement.textContent = currentInput.substring(0, maxDisplayLength) + "...";
        }
    } else {
        displayElement.textContent = currentInput;
    }
  }

  // Helper function to perform calculation
  function calculate() {
    if (previousInput === null || operator === null || currentInput === '') {
      return false;
    }
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) {
      currentInput = 'Error';
      operator = null;
      previousInput = null;
      mrcPressedOnce = false;
      return false;
    }
    let result;
    switch (operator) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/':
        if (current === 0) {
          currentInput = 'Error: Div by 0';
          operator = null;
          previousInput = null;
          mrcPressedOnce = false;
          return false;
        }
        result = prev / current;
        break;
      default: return false;
    }
    currentInput = result.toString();
    operator = null;
    previousInput = null;
    return true;
  }
  
  // Helper function to enable/disable buttons
  function setButtonsDisabled(disabled) {
      buttons.forEach(button => {
          if (button.value !== 'AC' && button.value !== 'OFF') { 
              button.disabled = disabled;
          }
          if (button.value === 'AC') {
              button.disabled = false;
          }
      });
  }

  // Event Listeners for Calculator Buttons
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.value;
      const targetButton = button; // Reference to the clicked button element

      if (isCalculatorOff && value !== 'AC' && value !== 'OFF') {
        return; 
      }

      if (mrcPressedOnce && (('0' <= value && value <= '9') || value === '.' || value === '00')) {
          if (value !== 'MRC') {
            currentInput = (value === '.') ? '0.' : value;
            mrcPressedOnce = false;
          }
      } else if (mrcPressedOnce && ['+', '-', '*', '/'].includes(value)) {
          mrcPressedOnce = false;
      }
      
      // If SHIFT is active, and the pressed button is not SHIFT itself,
      // we might want to handle it differently or just deactivate SHIFT.
      // For now, most buttons will deactivate SHIFT.
      let deactivateShiftAfterAction = true;


      switch (value) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          if (currentInput === '0' || currentInput === 'Error' || currentInput === 'Error: Div by 0' || mrcPressedOnce) {
            currentInput = value;
          } else {
            currentInput += value;
          }
          mrcPressedOnce = false;
          break;
        case '00':
          if (currentInput === '0' || currentInput === 'Error' || currentInput === 'Error: Div by 0' || mrcPressedOnce) {
            currentInput = '0'; 
          } else if (currentInput !== '') { 
            currentInput += '00';
          }
          mrcPressedOnce = false;
          break;
        case '.':
          if (mrcPressedOnce) {
            currentInput = '0.';
            mrcPressedOnce = false;
          } else if (!currentInput.includes('.')) {
            if (currentInput === '' || currentInput === 'Error' || currentInput === 'Error: Div by 0') {
                currentInput = '0.';
            } else {
                currentInput += '.';
            }
          }
          break;

        case '+': case '-': case '*': case '/':
          if (currentInput === 'Error' || currentInput === 'Error: Div by 0') break;
          if (operator !== null && previousInput !== null && currentInput !== '' && !mrcPressedOnce) {
            if (!calculate()) { 
                updateDisplay(); 
                break; 
            }
            previousInput = currentInput; 
          } else if (currentInput !== '') {
            previousInput = currentInput;
          }
          operator = value;
          displayElement.textContent = previousInput; 
          currentInput = ''; 
          mrcPressedOnce = false;
          // Deactivate shift when an operator is pressed as it implies starting a new part of calculation
          // isShiftActive = false; // Handled by general deactivation logic
          return; 

        case '=':
          if (currentInput === 'Error' || currentInput === 'Error: Div by 0') break;
          if (operator && previousInput !== null && (currentInput !== '' || mrcPressedOnce) ) {
             if (mrcPressedOnce && currentInput === '') {
                currentInput = memoryValue.toString();
             }
            calculate();
          }
          mrcPressedOnce = false;
          // isShiftActive = false; // Handled by general deactivation logic
          break;

        case 'AC':
          currentInput = '0';
          operator = null;
          previousInput = null;
          memoryValue = 0;
          mrcPressedOnce = false;
          isCalculatorOff = false;
          isShiftActive = false; // Deactivate SHIFT on AC
          document.querySelector('button[value="SHIFT"]').classList.remove('shift-active');
          currentModeIndex = 0; // Reset mode to default
          currentMode = modes[currentModeIndex];
          console.log("MODE reset to: " + currentMode);

          setButtonsDisabled(false); 
          displayElement.style.backgroundColor = '#D9E9D1'; 
          if (tvmModal) tvmModal.style.display = 'none';
          if (amrtModal) amrtModal.style.display = 'none';
          if (smplModal) smplModal.style.display = 'none';
          if (csmModal) csmModal.style.display = 'none';
          break;

        case 'C':
          if (currentInput === 'Error' || currentInput === 'Error: Div by 0') {
            currentInput = '0';
            operator = null;
            previousInput = null;
          } else {
            currentInput = '0'; 
          }
          mrcPressedOnce = false;
          // isShiftActive = false; // C might be a shifted function in future, so don't always turn off shift.
                               // For now, let general deactivation logic handle.
          break;

        case 'OFF':
          isCalculatorOff = true;
          currentInput = ''; 
          operator = null;
          previousInput = null;
          // isShiftActive = false; // SHIFT state could persist through OFF state
          // document.querySelector('button[value="SHIFT"]').classList.remove('shift-active');
          setButtonsDisabled(true); 
          displayElement.style.backgroundColor = '#808080'; 
          if (tvmModal) tvmModal.style.display = 'none';
          if (amrtModal) amrtModal.style.display = 'none';
          if (smplModal) smplModal.style.display = 'none';
          if (csmModal) csmModal.style.display = 'none';
          break;
        
        case 'M+':
        case 'M-':
          if (isCalculatorOff) break;
          if (currentInput !== 'Error' && currentInput !== 'Error: Div by 0' && currentInput !== '') {
            memoryValue += (value === 'M+' ? parseFloat(currentInput) : -parseFloat(currentInput));
            mrcPressedOnce = false;
          }
          break;
        case 'MRC':
          if (isCalculatorOff) break;
          if (mrcPressedOnce) {
            memoryValue = 0;
            mrcPressedOnce = false;
          } else {
            currentInput = memoryValue.toString();
            mrcPressedOnce = true;
          }
          deactivateShiftAfterAction = false; // MRC is often used with SHIFT for M- or M+
          break;

        case 'TVM':
        case 'AMRT':
        case 'SMPL':
        case 'COST':
        case 'SELL':
        case 'MAR':
          if (isCalculatorOff) break;
          // Logic for these buttons to show their respective modals
          const modalId = value.toLowerCase() + '-modal';
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = 'flex';
             if (value === 'COST' || value === 'SELL' || value === 'MAR') { // CSM modal specific reset
                if(csmCostInput) csmCostInput.value = '';
                if(csmSellInput) csmSellInput.value = '';
                if(csmMarInput) csmMarInput.value = '';
                if(csmErrorP) csmErrorP.textContent = '';
             }
          }
          mrcPressedOnce = false;
          return; // Prevent updateDisplay for modal buttons

        // SHIFT Button Functionality
        case 'SHIFT':
          if (isCalculatorOff) break;
          isShiftActive = !isShiftActive;
          targetButton.classList.toggle('shift-active', isShiftActive);
          console.log("SHIFT button pressed. Active: " + isShiftActive);
          mrcPressedOnce = false; 
          deactivateShiftAfterAction = false; // Pressing SHIFT itself shouldn't deactivate it
          return; // SHIFT button does not update display directly

        // MODE Button Functionality
        case 'MODE':
          if (isCalculatorOff) break;
          currentModeIndex = (currentModeIndex + 1) % modes.length;
          currentMode = modes[currentModeIndex];
          console.log("MODE button pressed. Current mode: " + currentMode);
          // Display mode temporarily (optional, can be expanded)
          // currentInput = currentMode; 
          // setTimeout(() => updateDisplay(), 100); // Show mode then clear or revert
          mrcPressedOnce = false;
          // isShiftActive = false; // Handled by general deactivation logic
          break;
          
        // Placeholder for other function buttons
        case '%': case 'GT': 
        case 'sqrt': case 'toggle-sign':
          if (isCalculatorOff) break;
          console.log(`Button "${value}" pressed. Not yet implemented.`);
          currentInput = 'NI'; 
          mrcPressedOnce = false;
          break;

        default:
          if (isCalculatorOff) break;
          console.log('Unhandled button value:', value);
          mrcPressedOnce = false;
          break;
      }

      // Deactivate SHIFT if a non-SHIFT, non-MRC button was pressed and SHIFT was active
      if (isShiftActive && deactivateShiftAfterAction) {
        isShiftActive = false;
        document.querySelector('button[value="SHIFT"]').classList.remove('shift-active');
        console.log("SHIFT deactivated after action.");
      }

      updateDisplay(); 
    });
  });

  // TVM Modal Functionality
  if (tvmModal) {
    if (tvmCloseButton) { tvmCloseButton.addEventListener('click', () => { tvmModal.style.display = 'none'; }); }
    tvmModal.addEventListener('click', (event) => { if (event.target === tvmModal) { tvmModal.style.display = 'none'; } });
    if (tvmCalculateButton) {
      tvmCalculateButton.addEventListener('click', () => {
        const pv = parseFloat(tvmPvInput.value);
        const rateAnnual = parseFloat(tvmRateInput.value);
        const nComp = parseFloat(tvmPeriodsInput.value);
        const t = parseFloat(tvmTimeInput.value);
        if (isNaN(pv) || isNaN(rateAnnual) || isNaN(nComp) || isNaN(t) || nComp <= 0 || t < 0 ) {
          alert('Please enter valid numbers for all TVM fields. Compounding periods (n) must be > 0 and Time (t) must be >= 0.');
          return;
        }
        const ratePerPeriod = (rateAnnual / 100) / nComp;
        const numberOfPayments = nComp * t;
        const fv = pv * Math.pow((1 + ratePerPeriod), numberOfPayments);
        currentInput = fv.toFixed(2);
        updateDisplay();
        tvmModal.style.display = 'none';
        operator = null;
        previousInput = null;
        mrcPressedOnce = false;
      });
    }
  }

  // AMRT Modal Functionality
  if (amrtModal) {
    if (amrtCloseButton) { amrtCloseButton.addEventListener('click', () => { amrtModal.style.display = 'none'; }); }
    amrtModal.addEventListener('click', (event) => { if (event.target === amrtModal) { amrtModal.style.display = 'none'; } });
    if (amrtCalculateButton) {
      amrtCalculateButton.addEventListener('click', () => {
        const P = parseFloat(amrtPrincipalInput.value);
        const r = parseFloat(amrtRateInput.value);
        const n = parseFloat(amrtPaymentsInput.value);
        if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) {
          alert('Please enter valid numbers for all AMRT fields. Principal, rate (>=0), and payments must be positive.');
          return;
        }
        let payment;
        if (r === 0) { payment = P / n; }
        else {
          const monthlyRate = r;
          const numerator = P * monthlyRate * Math.pow((1 + monthlyRate), n);
          const denominator = Math.pow((1 + monthlyRate), n) - 1;
          if (denominator === 0) { alert("Error in calculation: denominator is zero."); return; }
          payment = numerator / denominator;
        }
        currentInput = payment.toFixed(2);
        updateDisplay();
        amrtModal.style.display = 'none';
        operator = null;
        previousInput = null;
        mrcPressedOnce = false;
      });
    }
  }

  // SMPL Modal Functionality
  if (smplModal) {
    if (smplCloseButton) { smplCloseButton.addEventListener('click', () => { smplModal.style.display = 'none'; }); }
    smplModal.addEventListener('click', (event) => { if (event.target === smplModal) { smplModal.style.display = 'none'; } });
    if (smplCalculateButton) {
      smplCalculateButton.addEventListener('click', () => {
        const P = parseFloat(smplPrincipalInput.value);
        const r_percent = parseFloat(smplRateInput.value);
        const t = parseFloat(smplTimeInput.value);
        if (isNaN(P) || isNaN(r_percent) || isNaN(t) || P < 0 || r_percent < 0 || t < 0) {
          alert('Please enter valid, non-negative numbers for all SMPL fields.');
          return;
        }
        const r_decimal = r_percent / 100;
        const interest = P * r_decimal * t;
        currentInput = interest.toFixed(2);
        updateDisplay();
        smplModal.style.display = 'none';
        operator = null;
        previousInput = null;
        mrcPressedOnce = false;
      });
    }
  }

  // CSM Modal Functionality
  if (csmModal) {
    if (csmCloseButton) { csmCloseButton.addEventListener('click', () => { csmModal.style.display = 'none'; }); }
    csmModal.addEventListener('click', (event) => { if (event.target === csmModal) { csmModal.style.display = 'none'; } });
    if (csmCalculateButton) {
      csmCalculateButton.addEventListener('click', () => {
        const costVal = csmCostInput.value !== '' ? parseFloat(csmCostInput.value) : null;
        const sellVal = csmSellInput.value !== '' ? parseFloat(csmSellInput.value) : null;
        const marVal = csmMarInput.value !== '' ? parseFloat(csmMarInput.value) : null;

        let filledCount = 0;
        if (costVal !== null && !isNaN(costVal)) filledCount++;
        if (sellVal !== null && !isNaN(sellVal)) filledCount++;
        if (marVal !== null && !isNaN(marVal)) filledCount++;
        
        if(csmErrorP) csmErrorP.textContent = ''; // Clear previous error

        if (filledCount !== 2) {
          if(csmErrorP) csmErrorP.textContent = 'Please enter exactly two values.';
          return;
        }

        let result;

        if (costVal === null || isNaN(costVal)) { 
          if (sellVal <= 0) { if(csmErrorP) csmErrorP.textContent = "Sell Price must be > 0 to calculate Cost."; return; }
          result = sellVal * (1 - marVal / 100);
          csmCostInput.value = result.toFixed(2);
          currentInput = result.toFixed(2);
        } else if (sellVal === null || isNaN(sellVal)) { 
          if ((1 - marVal / 100) === 0) { if(csmErrorP) csmErrorP.textContent = "Margin cannot be 100% (division by zero)."; return; }
          if (marVal >= 100) { if(csmErrorP) csmErrorP.textContent = "Margin must be < 100% to calculate Sell Price."; return;}
          result = costVal / (1 - marVal / 100);
          csmSellInput.value = result.toFixed(2);
          currentInput = result.toFixed(2);
        } else if (marVal === null || isNaN(marVal)) { 
          if (sellVal === 0) { if(csmErrorP) csmErrorP.textContent = "Sell Price cannot be 0 for Margin calculation."; return; }
          result = ((sellVal - costVal) / sellVal) * 100;
          csmMarInput.value = result.toFixed(2);
          currentInput = result.toFixed(2);
        } else {
            if(csmErrorP) csmErrorP.textContent = 'Calculation logic error. Please check inputs.'; 
            return;
        }
        
        updateDisplay();
        operator = null;
        previousInput = null;
        mrcPressedOnce = false;
      });
    }
  }

  // Initial State
  updateDisplay(); 
});
