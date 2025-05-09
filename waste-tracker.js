// Waste Tracker Variables
const wasteForm = document.getElementById('waste-form');
const wasteEntriesList = document.getElementById('waste-entries');
const totalWaste = document.getElementById('total-waste');
const recycledWaste = document.getElementById('recycled-waste');
const landfillWaste = document.getElementById('landfill-waste');

// Waste categories with environmental impact scores
const wasteCategories = {
    plastic: { impact: 8, recyclingRate: 0.3, description: 'Takes 450+ years to decompose' },
    paper: { impact: 3, recyclingRate: 0.7, description: 'Biodegradable, but deforestation concern' },
    glass: { impact: 2, recyclingRate: 0.9, description: '100% recyclable, infinite times' },
    metal: { impact: 4, recyclingRate: 0.8, description: 'Highly recyclable, energy intensive' },
    organic: { impact: 1, recyclingRate: 1.0, description: 'Compostable, reduces landfill' },
    electronic: { impact: 9, recyclingRate: 0.2, description: 'Contains hazardous materials' },
    other: { impact: 5, recyclingRate: 0.4, description: 'Mixed waste, limited recycling' }
};

let wasteData = JSON.parse(localStorage.getItem('wasteData')) || [];
let monthlyGoal = JSON.parse(localStorage.getItem('monthlyGoal')) || null;

// Initialize waste tracker
function initializeWasteTracker() {
    if (wasteForm) {
        wasteForm.addEventListener('submit', handleWasteSubmit);
        updateWasteStats();
        renderWasteEntries();
        updateMonthlyGoal();
    }
}

// Handle waste form submission
function handleWasteSubmit(event) {
    event.preventDefault();
    
    const type = document.getElementById('waste-type').value;
    const amount = parseFloat(document.getElementById('waste-amount').value);
    const date = document.getElementById('waste-date').value;
    
    if (!type || !amount || !date) return;

    const entry = {
        type,
        amount,
        date,
        id: Date.now()
    };
    
    wasteData.push(entry);
    localStorage.setItem('wasteData', JSON.stringify(wasteData));
    
    updateWasteStats();
    renderWasteEntries();
    updateMonthlyGoal();
    event.target.reset();

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Waste entry added successfully!';
    wasteForm.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 3000);
}

// Update waste statistics
function updateWasteStats() {
    let total = 0, recycled = 0, landfill = 0;
    const monthlyData = wasteData.filter(entry => {
        const entryDate = new Date(entry.date);
        const currentDate = new Date();
        return entryDate.getMonth() === currentDate.getMonth() &&
               entryDate.getFullYear() === currentDate.getFullYear();
    });

    monthlyData.forEach(entry => {
        total += entry.amount;
        if (["plastic", "paper", "glass", "metal"].includes(entry.type)) {
            recycled += entry.amount;
        } else {
            landfill += entry.amount;
        }
    });

    if (totalWaste) totalWaste.textContent = `${total.toFixed(1)} kg`;
    if (recycledWaste) recycledWaste.textContent = `${recycled.toFixed(1)} kg`;
    if (landfillWaste) landfillWaste.textContent = `${landfill.toFixed(1)} kg`;

    updateMonthlyGoal();
}

// Render waste entries
function renderWasteEntries() {
    if (!wasteEntriesList) return;
    
    wasteEntriesList.innerHTML = '';
    wasteData.slice(-5).reverse().forEach(entry => {
        const li = document.createElement('li');
        const category = wasteCategories[entry.type];
        li.innerHTML = `
            <div class="entry-header">
                <span class="date">${entry.date}</span>
                <span class="amount">${entry.amount} kg</span>
            </div>
            <div class="entry-details">
                <span class="type">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
                <span class="impact">Impact: ${category.impact}/10</span>
            </div>
            <div class="entry-description">
                ${category.description}
            </div>
        `;
        wasteEntriesList.appendChild(li);
    });
}

// Monthly Goal Functions
function setMonthlyGoal() {
    const goalInput = document.getElementById('monthly-goal-input');
    if (goalInput) {
        const goal = parseFloat(goalInput.value);
        if (goal > 0) {
            monthlyGoal = {
                target: goal,
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            localStorage.setItem('monthlyGoal', JSON.stringify(monthlyGoal));
            updateMonthlyGoal();
            goalInput.value = '';
        }
    }
}

function updateMonthlyGoal() {
    const progressBar = document.getElementById('goal-progress-bar');
    const goalStatus = document.getElementById('goal-status');
    
    if (progressBar && goalStatus) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        if (monthlyGoal && monthlyGoal.month === currentMonth && monthlyGoal.year === currentYear) {
            const currentMonthWaste = wasteData
                .filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentMonth && 
                           entryDate.getFullYear() === currentYear;
                })
                .reduce((sum, entry) => sum + entry.amount, 0);
            
            const progress = Math.min((currentMonthWaste / monthlyGoal.target) * 100, 100);
            
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                goalStatus.textContent = `Goal reached! (${currentMonthWaste.toFixed(1)}/${monthlyGoal.target} kg)`;
                progressBar.style.backgroundColor = '#4CAF50';
            } else {
                goalStatus.textContent = `${currentMonthWaste.toFixed(1)}/${monthlyGoal.target} kg (${progress.toFixed(1)}%)`;
                progressBar.style.backgroundColor = progress > 75 ? '#FFC107' : '#2196F3';
            }
        } else {
            progressBar.style.width = '0%';
            goalStatus.textContent = 'Set your monthly goal to track progress';
            progressBar.style.backgroundColor = '#2196F3';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeWasteTracker();
    
    // Set default date to today
    const dateInput = document.getElementById('waste-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}); 