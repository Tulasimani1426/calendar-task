import React, { useState } from 'react';
import './App.css';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parse } from 'date-fns';
import events from './events.json';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();

  const renderHeader = () => {
    return (
      
      <div className="header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{'<'}</button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEE';
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const isSunday = format(day, 'i') === '7';
      days.push(
        <div className={`day ${isSunday ? 'sunday' : ''}`} key={i}>
          {format(day, dateFormat)}
        </div>
      );
    }
    return <div className="days-row">{days}</div>;
  };

  const getColor = (index) => {
    const colors = ['#c1dff4', '#d1f1d4', '#f3d8ac', '#faa5d9', '#edf7a3'];
    return colors[index % colors.length];
  };

  const hasConflict = (eventList) => {
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const eventsWithTimes = eventList.map(event => {
      const startTime = timeToMinutes(event.time);
      const duration = parseInt(event.duration);
      const endTime = startTime + (isNaN(duration) ? 60 : duration); // fallback duration = 60 mins
      return { ...event, startTime, endTime };
    });

    for (let i = 0; i < eventsWithTimes.length; i++) {
      for (let j = i + 1; j < eventsWithTimes.length; j++) {
        const a = eventsWithTimes[i];
        const b = eventsWithTimes[j];
        if ((a.startTime < b.endTime && a.endTime > b.startTime)) {
          return true;
        }
      }
    }
    return false;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        if (isSameMonth(day, monthStart)) {
          const eventsToday = events.filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(cloneDay, 'yyyy-MM-dd'));
          const conflict = hasConflict(eventsToday);

          days.push(
            <div
              className={`cell ${isSameDay(day, today) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${conflict ? 'conflict' : ''}`}
              key={day}
              onClick={() => setSelectedDate(cloneDay)}
            >
              <span className="number">{formattedDate}</span>
              {eventsToday.map((event, index) => (
                <div className="event" key={index} style={{ backgroundColor: getColor(index), marginTop: '6px', padding: '4px 6px', borderRadius: '6px', color: '#333', fontSize: '12px' }}>
                  {event.title}
                </div>
              ))}
              {conflict && <div className="conflict-warning">⚠️ Conflict</div>}
            </div>
          );
        } else {
          days.push(<div className="cell empty" key={day}></div>);
        }

        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const renderSelectedEvents = () => {
    if (!selectedDate) return null;

    const selectedEvents = events.filter(
      event => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );

    return (
      <div className="selected-events">
        <h3>Events on {format(selectedDate, 'PPP')}:</h3>
        {selectedEvents.length === 0 ? (
          <p>No events</p>
        ) : (
          <ul>
            {selectedEvents.map((event, index) => (
              <li key={index} style={{ backgroundColor: getColor(index), padding: '8px', margin: '6px 0', borderRadius: '6px', color: '#333', fontWeight: '500', fontSize: '14px' }}>
                <strong>{event.title}</strong> — {event.time} ({event.duration})
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="calendar">
       <h1 className="main-heading" style={{textAlign:'center' , fontFamily: "cursive" , textShadow:"1px 1px 2px violet"}}> Calendar</h1>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderSelectedEvents()}
    </div>
  );
}

export default App;
