const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const apiKey = 'AIzaSyDDxU_TpHGQ9PDRPnobrZN9yH-6KbgmvdY'; // Replace with your actual API key

// Waste management keywords to check for relevant questions
const wasteKeywords = [
    'recycle', 'recycling','carbon','footprint', 'waste', 'garbage', 'trash', 'compost',
    'landfill', 'collection', 'disposal', 'hazardous', 'ewaste',
    'organic', 'plastic', 'paper', 'glass', 'metal', 'yard waste',
    'schedule', 'pickup', 'bin', 'container', 'separate', 'sorting',
    'reduce', 'reuse', 'repurpose', 'donate', 'battery', 'chemical',
    'paint', 'oil', 'tire', 'electronics', 'appliance', 'bulky',
    'municipal', 'city', 'county', 'waste management', 'sanitation',
    'environment', 'sustainability', 'zero waste', 'circular economy',
    'composting', 'vermicomposting', 'food waste', 'biodegradable',
    'recycling center', 'transfer station', 'incineration', 'wte',
    'waste to energy', 'single stream', 'dual stream', 'contamination'
];

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user-message', message);
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatLog.appendChild(typingIndicator);
    chatLog.scrollTop = chatLog.scrollHeight;

    try {
        // First check if the question is waste management related
        const isWasteQuestion = wasteKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );

        if (!isWasteQuestion) {
            removeTypingIndicator();
            appendMessage('bot-message', "I specialize in Waste Management topics. Please ask me about:\n\n1. Recycling guidelines\n2. Waste collection schedules\n3. Hazardous waste disposal\n4. Composting techniques\n5. Waste reduction strategies");
            return;
        }

        // Add context to ensure the response stays on topic
        const prompt = `You are a Waste Management expert assistant. 
        Only answer questions related to waste collection, recycling, disposal, and sustainability.
        If the question is not about waste management, respond with: "I specialize in Waste Management topics. Please ask me about recycling, waste collection, disposal methods, or sustainability practices."

        Provide answers with the following structure:
        1. Begin with a concise definition or overview
        2. Break down the explanation into clear, numbered points
        3. Include specific categories (highlight if recycling/compost/hazardous)
        4. Provide local guidelines when helpful (describe in text)
        5. Mention environmental benefits if relevant
        6. Include proper disposal methods where applicable

        Format your response with each point on a new line. 
        Highlight recycling with [Recycling], compost with [Compost], and hazardous waste with [Hazardous] tags.

        Question: ${message}`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            removeTypingIndicator();
            appendMessage('bot-message', `Error: ${response.status} - ${errorData.error.message || 'Something went wrong.'}`);
            return;
        }

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        removeTypingIndicator();
        appendMessage('bot-message', botResponse);

    } catch (error) {
        removeTypingIndicator();
        appendMessage('bot-message', `Error: ${error.message || 'Failed to send message.'}`);
    }
}

function removeTypingIndicator() {
    const typingIndicators = document.querySelectorAll('.typing-indicator');
    typingIndicators.forEach(indicator => indicator.remove());
}

function appendMessage(className, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(className);
    
    // Add timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (className === 'bot-message') {
        // Clean up the message
        let cleanedMessage = message
            .replace(/\*\*/g, '') // Remove bold
            .replace(/\*/g, '')   // Remove italics
            .trim();
        
        // Format waste category tags
        cleanedMessage = cleanedMessage.replace(/\[Recycling\]/g, '<span class="waste-category recycling">Recycling</span>');
        cleanedMessage = cleanedMessage.replace(/\[Compost\]/g, '<span class="waste-category compost">Compost</span>');
        cleanedMessage = cleanedMessage.replace(/\[Hazardous\]/g, '<span class="waste-category hazardous">Hazardous</span>');
        
        // Split the message into logical points
        const points = cleanedMessage.split('\n')
            .map(point => point.trim())
            .filter(point => point.length > 0);
        
        // Create a container for all points
        const pointsContainer = document.createElement('div');
        
        // Process each point
        points.forEach(point => {
            // Skip empty points
            if (!point) return;
            
            // Check if this point is a numbered list item
            if (point.match(/^\d+\.\s/)) {
                if (!pointsContainer.querySelector('ol')) {
                    const ol = document.createElement('ol');
                    pointsContainer.appendChild(ol);
                }
                const li = document.createElement('li');
                li.innerHTML = point.replace(/^\d+\.\s/, '');
                pointsContainer.querySelector('ol').appendChild(li);
            } 
            // Check if this point is a bullet list item
            else if (point.match(/^-\s/)) {
                if (!pointsContainer.querySelector('ul')) {
                    const ul = document.createElement('ul');
                    pointsContainer.appendChild(ul);
                }
                const li = document.createElement('li');
                li.innerHTML = point.replace(/^-\s/, '');
                pointsContainer.querySelector('ul').appendChild(li);
            } 
            // Regular point
            else {
                const p = document.createElement('p');
                p.innerHTML = point;
                pointsContainer.appendChild(p);
            }
        });
        
        // Add environmental benefits if mentioned
        const benefitsMatch = cleanedMessage.match(/environmental benefits:?\s*(.*)/i);
        if (benefitsMatch) {
            const benefitsDiv = document.createElement('div');
            benefitsDiv.className = 'waste-category';
            benefitsDiv.innerHTML = `<strong>Environmental Benefits:</strong> ${benefitsMatch[1]}`;
            pointsContainer.appendChild(benefitsDiv);
        }
        
        // Add disposal note if mentioned
        const disposalMatch = cleanedMessage.match(/disposal methods:?\s*(.*)/i);
        if (disposalMatch) {
            const disposalDiv = document.createElement('div');
            disposalDiv.className = 'waste-category';
            disposalDiv.innerHTML = `<strong>Proper Disposal:</strong> ${disposalMatch[1]}`;
            pointsContainer.appendChild(disposalDiv);
        }
        
        messageDiv.appendChild(pointsContainer);
        messageDiv.innerHTML += `<span class="time-stamp">${timeString}</span>`;
    } else {
        messageDiv.innerHTML = message + `<span class="time-stamp">${timeString}</span>`;
    }
    
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on page load
window.addEventListener('load', () => {
    userInput.focus();
});

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