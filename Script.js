document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const monthYearElement = document.getElementById('month-year');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const datesContainer = document.getElementById('dates');
    const todayBtn = document.getElementById('button');
    const dateInput = document.getElementById('Date');
    const timeElement = document.querySelector('.time');
    const dateEventDaysElement = document.getElementById('dateEvent_days');
    const dateEventDayTimeElement = document.getElementById('dateEvent_day_time');
    const noEventsMessage = document.getElementById('no-events-message');
    const eventsList = document.querySelector('.Eevent_list ul');
    const addEventForm = document.getElementById('add-event-form');
    const addEventBtn = document.getElementById('Addevent');
    const closeEventBtn = document.getElementById('closeEventBtn');
    const clearInputBtn = document.getElementById('clear_input');
    const submitEventBtn = document.getElementById('submit-event');
    const eventTitleInput = document.getElementById('event-title');
    const eventTimeToInput = document.getElementById('event-time-to');
    const eventTimeFromInput = document.getElementById('event-time-from');
    const resetEventsBtn = document.getElementById('resetEventsBtn');

    // State
    let currentDate = new Date();
    let selectedDate = new Date();
    let events = {};

    // Initialize app
    function init() {
        renderCalendar();
        updateTime();
        updateSelectedDateDisplay();
        loadEvents();
        setInterval(updateTime, 1000);
        
        todayBtn.addEventListener('click', goToToday);
        prevBtn.addEventListener('click', goToPrevMonth);
        nextBtn.addEventListener('click', goToNextMonth);
        dateInput.addEventListener('input', formatDateInput);
        addEventBtn.addEventListener('click', showAddEventForm);
        closeEventBtn.addEventListener('click', hideAddEventForm);
        clearInputBtn.addEventListener('click', clearEventForm);
        submitEventBtn.addEventListener('click', addNewEvent);
        resetEventsBtn.addEventListener('click', resetAllEvents);
        
        eventTimeToInput.addEventListener('input', () => {
            eventTimeToInput.value = eventTimeToInput.value.replace(/[^0-9]/g, '');
        });
        eventTimeFromInput.addEventListener('input', () => {
            eventTimeFromInput.value = eventTimeFromInput.value.replace(/[^0-9]/g, '');
        });
    }


    // Calendar rendering
    function renderCalendar() {
        datesContainer.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const totalDays = lastDay.getDate();
        let firstDayIndex = firstDay.getDay();
        const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
        // Previous month days
        for (let i = firstDayIndex; i > 0; i--) {
            const dateElement = document.createElement('div');
            dateElement.textContent = prevLastDay - i + 1;
            dateElement.classList.add('other-month');
            datesContainer.appendChild(dateElement);
        }
    
        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            const dateElement = document.createElement('div');
            dateElement.textContent = i;
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dateKey = formatDateKey(cellDate);
            
            if (events[dateKey]?.length > 0) {
                dateElement.classList.add('has-events');
                
                if (cellDate < today) {
                    dateElement.classList.add('past');
                } else if (cellDate > today) {
                    dateElement.classList.add('future');
                }
            }
            
            if (i === today.getDate() && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear()) {
                dateElement.classList.add('today');
            }
            
            if (i === selectedDate.getDate() && 
                currentDate.getMonth() === selectedDate.getMonth() && 
                currentDate.getFullYear() === selectedDate.getFullYear()) {
                dateElement.classList.add('selected');
            }
    
            dateElement.addEventListener('click', () => selectDate(i));
            datesContainer.appendChild(dateElement);
        }
    
        // Next month days
        const daysLeft = 42 - (firstDayIndex + totalDays);
        for (let i = 1; i <= daysLeft; i++) {
            const dateElement = document.createElement('div');
            dateElement.textContent = i;
            dateElement.classList.add('other-month');
            datesContainer.appendChild(dateElement);
        }
    }

    // Time/date functions
    function updateTime() {
        const now = new Date();
        timeElement.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        dateInput.value = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    }

    function selectDate(day) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        updateSelectedDateDisplay();
        renderEventsForSelectedDate();
        renderCalendar();
    }

    function goToToday() {
        currentDate = new Date();
        selectedDate = new Date();
        renderCalendar();
        updateSelectedDateDisplay();
        renderEventsForSelectedDate();
    }

    function goToPrevMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    function goToNextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    function formatDateInput(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2);
        if (value.length > 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
        e.target.value = value;
    }

    function updateSelectedDateDisplay() {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dateEventDaysElement.textContent = dayNames[selectedDate.getDay()];
        dateEventDayTimeElement.textContent = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }

    // Event management
    function addNewEvent() {
        const title = eventTitleInput.value.trim();
        const timeTo = eventTimeToInput.value.trim();
        const timeFrom = eventTimeFromInput.value.trim();

        if (!title || !timeTo || !timeFrom) {
            alert('Please fill all fields');
            return;
        }

        const event = {
            title,
            timeTo,
            timeFrom,
            timeDisplay: `${formatTime(timeTo)} - ${formatTime(timeFrom)}`,
            id: Date.now()
        };

        const dateKey = formatDateKey(selectedDate);
        if (!events[dateKey]) events[dateKey] = [];
        events[dateKey].push(event);

        saveEvents();
        renderEventsForSelectedDate();
        renderCalendar();
        hideAddEventForm();
    }

    function renderEventsForSelectedDate() {
        eventsList.innerHTML = '';
        const dateKey = formatDateKey(selectedDate);
        const dateEvents = events[dateKey] || [];

        if (dateEvents.length === 0) {
            noEventsMessage.style.display = 'block';
        } else {
            noEventsMessage.style.display = 'none';
            dateEvents.forEach(event => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <i class="fa-solid fa-circle"></i>
                    <div class="text-container">
                        <span class="title_event">${event.title}</span>
                        <div>${event.timeDisplay}</div>
                    </div>
                    <a href="#" data-id="${event.id}"><i class="fa-solid fa-trash"></i></a>
                `;
                li.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    deleteEvent(event.id, dateKey);
                });
                eventsList.appendChild(li);
            });
        }
    }

    function deleteEvent(id, dateKey) {
        if (confirm('Delete this event?')) {
            events[dateKey] = events[dateKey].filter(e => e.id !== id);
            if (events[dateKey].length === 0) delete events[dateKey];
            saveEvents();
            renderEventsForSelectedDate();
            renderCalendar();
        }
    }

    function resetAllEvents() {
        if (confirm('Clear ALL events?')) {
            events = {};
            saveEvents();
            renderCalendar();
            renderEventsForSelectedDate();
        }
    }

    // Helper functions
    function formatTime(time) {
        const timeStr = String(time).padStart(4, '0');
        let hours = parseInt(timeStr.substring(0, 2)) || 0;
        const minutes = timeStr.substring(2, 4).padEnd(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    function formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    function loadEvents() {
        events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    }

    function showAddEventForm() {
        addEventForm.style.display = 'block';
        addEventForm.classList.remove('hiding');
        addEventForm.classList.add('visible');
        addEventBtn.style.display = 'none';
    }

    function hideAddEventForm() {
        addEventForm.classList.remove('visible');
        addEventForm.classList.add('hiding');	
        setTimeout(() => {
            addEventForm.style.display = 'none';
            addEventBtn.style.display = 'flex';
            addEventForm.style.left = '';
            addEventForm.style.top = '';
        }, 200); 
        clearEventForm();
    }

    let offsetX, offsetY, isDragging = false;

    function startDrag(e) {
        isDragging = true;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - addEventForm.offsetLeft;
        offsetY = clientY - addEventForm.offsetTop;
        addEventForm.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (isDragging) {
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            addEventForm.style.left = `${clientX - offsetX}px`;
            addEventForm.style.top = `${clientY - offsetY}px`;
        }
    }

    function endDrag() {
        isDragging = false;
        addEventForm.style.cursor = 'grab';
    }

    addEventForm.addEventListener('mousedown', startDrag);
    addEventForm.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function clearEventForm() {
        eventTitleInput.value = '';
        eventTimeToInput.value = '';
        eventTimeFromInput.value = '';
    }

    document.getElementById('resetEventsBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all events?')) {
            alert('All events have been reset!');
        }
    });

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const theme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }
      
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      themeToggle.addEventListener('click', toggleTheme);
    init();
    
});
