// Carbon Footprint Calculator
function calculateFootprint() {
    const plastic = parseFloat(document.getElementById('plastic-amount').value) || 0;
    const paper = parseFloat(document.getElementById('paper-amount').value) || 0;
    const glass = parseFloat(document.getElementById('glass-amount').value) || 0;
    const metal = parseFloat(document.getElementById('metal-amount').value) || 0;

    // Emission factors (kg CO2e per kg waste)
    const factors = {
        plastic: 6,
        paper: 1.5,
        glass: 0.8,
        metal: 9
    };

    const totalCO2 = plastic * factors.plastic + 
                    paper * factors.paper + 
                    glass * factors.glass + 
                    metal * factors.metal;

    // Update result display
    const resultElement = document.getElementById('carbon-result');
    if (resultElement) {
        resultElement.textContent = `Estimated: ${totalCO2.toFixed(2)} kg CO₂e/month`;
    }

    // Update meter
    const meter = document.getElementById('carbon-level');
    if (meter) {
        const percent = Math.min(totalCO2 / 100, 1) * 100;
        meter.style.width = percent + '%';
        meter.style.background = percent < 33 ? '#4caf50' : percent < 66 ? '#ffc107' : '#f44336';
    }

    // Update message
    const message = document.getElementById('carbon-message');
    if (message) {
        if (totalCO2 < 30) {
            message.textContent = 'Great job! Your waste carbon footprint is low.';
        } else if (totalCO2 < 70) {
            message.textContent = 'Moderate footprint. Try to recycle and reduce waste.';
        } else {
            message.textContent = 'High footprint. Consider more waste reduction strategies!';
        }
    }

    // Update tips
    const tips = document.getElementById('carbon-tips');
    if (tips) {
        tips.innerHTML = '';
        const tipsArr = [
            'Use reusable containers and bags.',
            'Compost organic waste.',
            'Buy products with minimal packaging.',
            'Recycle properly according to local guidelines.'
        ];
        tipsArr.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tips.appendChild(li);
        });
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateFootprint();
        });
    }
}); 