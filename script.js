$(document).ready(function() {
    function loadTrades() {
        return JSON.parse(localStorage.getItem('trades')) || [];
    }

    function saveTrades(trades) {
        localStorage.setItem('trades', JSON.stringify(trades));
    }

    function addTradeToCalendar(trade, calendar) {
        updateDaySummary(trade.dateTime, calendar);
    }

    function updateDaySummary(dateTime, calendar) {
        const date = moment(dateTime).format('YYYY-MM-DD');
        const trades = loadTrades();
        const dayTrades = trades.filter(trade => moment(trade.dateTime).format('YYYY-MM-DD') === date);
        
        const totalProfitLoss = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        const tradeCount = dayTrades.length;

        const dayEl = calendar.find(`.fc-day[data-date="${date}"]`);
        const headerEl = calendar.find(`.fc-day-top[data-date="${date}"] .fc-day-number`);

        if (tradeCount > 0) {
            if (totalProfitLoss > 0) {
                dayEl.css('background-color', 'lightgreen');
            } else if (totalProfitLoss < 0) {
                dayEl.css('background-color', 'lightcoral');
            } else {
                dayEl.css('background-color', '');
            }

            const summary = `${moment(dateTime).format('MMM D')} - ${tradeCount} trade${tradeCount !== 1 ? 's' : ''}, ${totalProfitLoss >= 0 ? '$' : '-$'}${Math.abs(totalProfitLoss).toFixed(2)}`;
            headerEl.attr('data-summary', summary);
            headerEl.text(summary);
        } else {
            dayEl.css('background-color', '');
            headerEl.attr('data-summary', '');
            headerEl.text(moment(dateTime).format('MMM D'));
        }
    }

    function initializeCalendar() {
        const trades = loadTrades();
        const calendar = $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            events: [],
            editable: true,
            droppable: true,
            dayRender: function(date, cell) {
                updateDaySummary(date.format(), $('#calendar'));
            }
        });

        trades.forEach(trade => {
            addTradeToCalendar(trade, calendar);
        });

        return calendar;
    }

    $('#tradeForm').on('submit', function(e) {
        e.preventDefault();
        const dateTime = $('#dateTime').val();
        const profitLoss = parseFloat($('#profitLoss').val());

        if (!dateTime || isNaN(profitLoss)) {
            alert('Please fill in all fields');
            return;
        }

        const trade = {
            dateTime,
            profitLoss
        };

        const trades = loadTrades();
        trades.push(trade);
        saveTrades(trades);

        addTradeToCalendar(trade, $('#calendar'));
    });

    const calendar = initializeCalendar();
});
