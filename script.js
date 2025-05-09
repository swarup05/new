// Waste Tracker Functionality
const wasteForm = document.getElementById('waste-form');
const wasteEntriesList = document.getElementById('waste-entries');
const totalWaste = document.getElementById('total-waste');
const recycledWaste = document.getElementById('recycled-waste');
const landfillWaste = document.getElementById('landfill-waste');

// Add waste categories with their environmental impact scores (1-10)
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
let wasteGoals = JSON.parse(localStorage.getItem('wasteGoals')) || {
    monthly: 100, // kg
    recycling: 70 // percentage
};

// Function to calculate environmental impact
function calculateEnvironmentalImpact(wasteData) {
    return wasteData.reduce((total, entry) => {
        const category = wasteCategories[entry.type];
        return total + (entry.amount * category.impact);
    }, 0);
}

// Function to calculate recycling rate
function calculateRecyclingRate(wasteData) {
    const total = wasteData.reduce((sum, entry) => sum + entry.amount, 0);
    const recyclable = wasteData.reduce((sum, entry) => {
        if (["plastic", "paper", "glass", "metal"].includes(entry.type)) {
            return sum + entry.amount;
        }
        return sum;
    }, 0);
    return total > 0 ? (recyclable / total) * 100 : 0;
}

// Function to update waste statistics
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

    totalWaste.textContent = `${total.toFixed(1)} kg`;
    recycledWaste.textContent = `${recycled.toFixed(1)} kg`;
    landfillWaste.textContent = `${landfill.toFixed(1)} kg`;

    // Update progress towards goals
    const recyclingRate = calculateRecyclingRate(monthlyData);
    const impact = calculateEnvironmentalImpact(monthlyData);

    // Add goal progress indicators
    const goalProgress = document.createElement('div');
    goalProgress.className = 'goal-progress';
    goalProgress.innerHTML = `
        <div class="progress-item">
            <h4>Monthly Goal Progress</h4>
            <div class="progress-bar">
                <div class="progress" style="width: ${Math.min((total / wasteGoals.monthly) * 100, 100)}%"></div>
            </div>
            <p>${total.toFixed(1)}/${wasteGoals.monthly} kg</p>
        </div>
        <div class="progress-item">
            <h4>Recycling Rate</h4>
            <div class="progress-bar">
                <div class="progress" style="width: ${recyclingRate}%"></div>
            </div>
            <p>${recyclingRate.toFixed(1)}% (Goal: ${wasteGoals.recycling}%)</p>
        </div>
    `;

    // Add environmental impact score
    const impactScore = document.createElement('div');
    impactScore.className = 'impact-score';
    impactScore.innerHTML = `
        <h4>Environmental Impact Score</h4>
        <div class="score">${impact.toFixed(1)}</div>
        <p>Lower is better</p>
    `;

    // Update the stats container
    const statsContainer = document.querySelector('.tracker-stats');
    statsContainer.appendChild(goalProgress);
    statsContainer.appendChild(impactScore);
}

// Function to render waste entries with more details
function renderWasteEntries() {
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

// Add event listener for waste form submission
if (wasteForm) {
    wasteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('waste-type').value;
        const amount = parseFloat(document.getElementById('waste-amount').value);
        const date = document.getElementById('waste-date').value;
        
        if (!type || !amount || !date) return;

        wasteData.push({ type, amount, date });
        localStorage.setItem('wasteData', JSON.stringify(wasteData));
        
        updateWasteStats();
        renderWasteEntries();
        wasteForm.reset();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Waste entry added successfully!';
        wasteForm.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
    });

    // Initialize stats and entries
    updateWasteStats();
    renderWasteEntries();
}

// Carbon Footprint Calculator
function calculateFootprint() {
    const plastic = parseFloat(document.getElementById('plastic-amount').value) || 0;
    const paper = parseFloat(document.getElementById('paper-amount').value) || 0;
    const glass = parseFloat(document.getElementById('glass-amount').value) || 0;
    const metal = parseFloat(document.getElementById('metal-amount').value) || 0;
    // Example emission factors (kg CO2e per kg waste)
    const factors = { plastic: 6, paper: 1.5, glass: 0.8, metal: 9 };
    const totalCO2 = plastic * factors.plastic + paper * factors.paper + glass * factors.glass + metal * factors.metal;
    document.getElementById('carbon-result').textContent = `Estimated: ${totalCO2.toFixed(2)} kg CO₂e/month`;
    // Update meter
    const meter = document.getElementById('carbon-level');
    const percent = Math.min(totalCO2 / 100, 1) * 100;
    meter.style.width = percent + '%';
    meter.style.background = percent < 33 ? '#4caf50' : percent < 66 ? '#ffc107' : '#f44336';
    // Message
    const message = document.getElementById('carbon-message');
    if (totalCO2 < 30) message.textContent = 'Great job! Your waste carbon footprint is low.';
    else if (totalCO2 < 70) message.textContent = 'Moderate footprint. Try to recycle and reduce waste.';
    else message.textContent = 'High footprint. Consider more waste reduction strategies!';
    // Tips
    const tips = document.getElementById('carbon-tips');
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

// Collection Centers (Mock Data & Filtering)
const centersList = document.getElementById('centers-list');
const mapPlaceholder = document.getElementById('map-placeholder');
const mockCenters = [
    { name: 'Green Recycle Center', type: 'plastic', location: 'Pune', address: '123 Main St' },
    { name: 'Paper Pickup', type: 'paper', location: 'Mumbai', address: '456 Oak Ave' },
    { name: 'Glass Depot', type: 'glass', location: 'Delhi', address: '789 Pine Rd' },
    { name: 'Metal Matters', type: 'metal', location: 'Nashik', address: '321 Maple St' },
    { name: 'E-Waste Solutions', type: 'electronic', location: 'Nagpur', address: '654 Cedar Blvd' },
    { name: 'Hazardous Hub', type: 'hazardous', location: 'Surat', address: '987 Birch Ln' },
    { name: 'Eco Recycle', type: 'plastic', location: 'Bhopal', address: '101 Green St' },
    { name: 'Paper Plus', type: 'paper', location: 'Hyderabad', address: '202 Blue Ave' },
    { name: 'Glass & More', type: 'glass', location: 'Noida', address: '303 Red Rd' },
    { name: 'Metal Works', type: 'metal', location: 'Indore', address: '404 Yellow St' },
    { name: 'E-Waste Experts', type: 'electronic', location: 'Jaipur', address: '505 Purple Blvd' }
];

// Add Chart.js library
document.head.innerHTML += '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';

// Function to fetch waste data from Gemini API
async function fetchWasteData(location) {
    const apiKey = 'AIzaSyC_PCwuR0rb-A7_KSnwFNI2GBokanzBKpAY';
    
    // Using Google's Gemini API
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const prompt = `Generate waste management data for ${location} in JSON format with the following structure:
    [
        {"type": "Plastic", "amount": number},
        {"type": "Paper", "amount": number},
        {"type": "Glass", "amount": number},
        {"type": "Metal", "amount": number},
        {"type": "Electronic", "amount": number},
        {"type": "Hazardous", "amount": number}
    ]
    where number should be a realistic estimate between 0 and 100`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (result.error) {
            console.error('API Error:', result.error);
            // Fallback to mock data if API fails
            return [
                { type: "Plastic", amount: Math.floor(Math.random() * 50) + 20 },
                { type: "Paper", amount: Math.floor(Math.random() * 40) + 15 },
                { type: "Glass", amount: Math.floor(Math.random() * 30) + 10 },
                { type: "Metal", amount: Math.floor(Math.random() * 25) + 5 },
                { type: "Electronic", amount: Math.floor(Math.random() * 20) + 5 },
                { type: "Hazardous", amount: Math.floor(Math.random() * 15) + 5 }
            ];
        }

        // Parse the response from Gemini
        const generatedText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(generatedText);
        return parsedData;

    } catch (error) {
        console.error('Error:', error);
        // Fallback to mock data if API fails
        return [
            { type: "Plastic", amount: Math.floor(Math.random() * 50) + 20 },
            { type: "Paper", amount: Math.floor(Math.random() * 40) + 15 },
            { type: "Glass", amount: Math.floor(Math.random() * 30) + 10 },
            { type: "Metal", amount: Math.floor(Math.random() * 25) + 5 },
            { type: "Electronic", amount: Math.floor(Math.random() * 20) + 5 },
            { type: "Hazardous", amount: Math.floor(Math.random() * 15) + 5 }
        ];
    }
}

// Update findCenters function to be async
async function findCenters() {
    const location = document.getElementById('location-input').value.trim();
    if (!location) {
        mapPlaceholder.innerHTML = '<p>Please enter a location</p>';
        return;
    }

    const filter = document.getElementById('waste-filter').value;
    let results = mockCenters.filter(center => {
        const matchesLocation = center.location.toLowerCase().includes(location.toLowerCase());
        const matchesType = filter === 'all' || center.type === filter;
        return matchesLocation && matchesType;
    });

    // Display centers
    centersList.innerHTML = '';
    if (results.length === 0) {
        centersList.innerHTML = '<p>No centers found for your search.</p>';
    } else {
        results.forEach(center => {
            const div = document.createElement('div');
            div.className = 'center-card';
            div.innerHTML = `<h4>${center.name}</h4><p>Type: ${center.type.charAt(0).toUpperCase() + center.type.slice(1)}</p><p>Location: ${center.location}</p><p>Address: ${center.address}</p>`;
            centersList.appendChild(div);
        });
    }

    // Generate and display the graph
    try {
        await renderWasteGraphs(location);
    } catch (error) {
        console.error('Error rendering graph:', error);
        mapPlaceholder.innerHTML = '<p>Error generating waste data visualization</p>';
    }
}

// Update renderWasteGraphs function
async function renderWasteGraphs(location) {
    // Clear previous graph
    mapPlaceholder.innerHTML = '<canvas id="wasteGraph"></canvas>';
    const ctx = document.getElementById('wasteGraph');

    // Show loading state
    mapPlaceholder.insertAdjacentHTML('beforeend', '<p>Loading waste data...</p>');

    try {
        const wasteData = await fetchWasteData(location);
        console.log('Received waste data:', wasteData);

        if (!wasteData || wasteData.length === 0) {
            mapPlaceholder.innerHTML = '<p>No waste data available for this location</p>';
            return;
        }

        // Remove loading message
        mapPlaceholder.querySelector('p')?.remove();

        // Create the chart
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: wasteData.map(item => item.type),
                datasets: [{
                    label: `Waste Distribution in ${location}`,
                    data: wasteData.map(item => item.amount),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (kg)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Waste Distribution in ${location}`,
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
        mapPlaceholder.innerHTML = '<p>Error creating waste data visualization</p>';
    }
}

// Education Tabs
function openTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.style.display = 'none');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    const btn = Array.from(buttons).find(b => b.textContent.toLowerCase().includes(tabId));
    if (btn) btn.classList.add('active');
}

// Set default tab on load
document.addEventListener('DOMContentLoaded', () => {
    updateWasteStats();
    renderWasteEntries();
    openTab('recycling');
});

// Global variables
let wasteEntries = JSON.parse(localStorage.getItem('wasteEntries')) || [];
let monthlyGoal = JSON.parse(localStorage.getItem('monthlyGoal')) || null;
let collectionCenters = [
    { name: "Pune Recycling Center", type: "plastic", location: "Pune", address: "123 Main St, Pune" },
    { name: "Mumbai Waste Management", type: "paper", location: "Mumbai", address: "456 Marine Drive, Mumbai" },
    { name: "Delhi Eco Center", type: "glass", location: "Delhi", address: "789 Connaught Place, Delhi" },
    { name: "Bangalore Green Hub", type: "metal", location: "Bangalore", address: "321 MG Road, Bangalore" },
    { name: "Chennai Recycling Point", type: "organic", location: "Chennai", address: "654 Marina Beach Road, Chennai" },
    { name: "Hyderabad Eco Station", type: "electronic", location: "Hyderabad", address: "987 Hitech City, Hyderabad" }
];

// Waste Tracker Functions
function initializeWasteTracker() {
    const wasteForm = document.getElementById('waste-form');
    if (wasteForm) {
        wasteForm.addEventListener('submit', handleWasteSubmit);
        updateWasteStats();
        displayWasteEntries();
        updateMonthlyGoal();
    }
}

function handleWasteSubmit(event) {
    event.preventDefault();
    
    const wasteType = document.getElementById('waste-type').value;
    const amount = parseFloat(document.getElementById('waste-amount').value);
    const date = document.getElementById('waste-date').value;
    
    const entry = {
        type: wasteType,
        amount: amount,
        date: date,
        id: Date.now()
    };
    
    wasteEntries.push(entry);
    localStorage.setItem('wasteEntries', JSON.stringify(wasteEntries));
    
    updateWasteStats();
    displayWasteEntries();
    updateMonthlyGoal();
    event.target.reset();
}

function displayWasteEntries() {
    const entriesList = document.getElementById('waste-entries');
    if (entriesList) {
        entriesList.innerHTML = '';
        const recentEntries = wasteEntries.slice(-5).reverse();
        
        recentEntries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="entry-type">${entry.type}</span>
                <span class="entry-amount">${entry.amount} kg</span>
                <span class="entry-date">${entry.date}</span>
            `;
            entriesList.appendChild(li);
        });
    }
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
        // Check if goal exists and is for current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        if (monthlyGoal && monthlyGoal.month === currentMonth && monthlyGoal.year === currentYear) {
            // Calculate current month's waste
            const currentMonthWaste = wasteEntries
                .filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentMonth && 
                           entryDate.getFullYear() === currentYear;
                })
                .reduce((sum, entry) => sum + entry.amount, 0);
            
            // Calculate progress percentage
            const progress = Math.min((currentMonthWaste / monthlyGoal.target) * 100, 100);
            
            // Update progress bar
            progressBar.style.width = `${progress}%`;
            
            // Update status message
            if (progress >= 100) {
                goalStatus.textContent = `Goal reached! (${currentMonthWaste.toFixed(1)}/${monthlyGoal.target} kg)`;
                progressBar.style.backgroundColor = '#4CAF50';
            } else {
                goalStatus.textContent = `${currentMonthWaste.toFixed(1)}/${monthlyGoal.target} kg (${progress.toFixed(1)}%)`;
                progressBar.style.backgroundColor = progress > 75 ? '#FFC107' : '#2196F3';
            }
        } else {
            // Reset or show default state
            progressBar.style.width = '0%';
            goalStatus.textContent = 'Set your monthly goal to track progress';
            progressBar.style.backgroundColor = '#2196F3';
        }
    }
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            authButtons.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
            authButtons.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });
}); 