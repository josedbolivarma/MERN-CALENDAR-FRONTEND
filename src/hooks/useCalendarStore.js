import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { calendarApi } from '../api';
import { convertEventsToDateEvents } from '../helpers';
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from '../store';


export const useCalendarStore = () => {
  
    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector( state => state.calendar );
    const { user } = useSelector( state => state.auth );

    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent( calendarEvent ) )
    }

    const startSavingEvent = async ( calendarEvent ) => {
        // TODO: llegar al backend
        try {
            if( calendarEvent.id ) {
                // Actualizando
                await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent );
                dispatch( onUpdateEvent({ ...calendarEvent, user }) );
                return;
            } 
                // Creando
                const { data } = await calendarApi.post('/events', calendarEvent );
                dispatch( onAddNewEvent({ ...calendarEvent, id: data.eventoGuardado.id, user }) );
        } catch (error) {
            console.log(error);
            Swal.fire('Error al guardar', error.response.data?.msg, 'error' );
        }
    }

    const startDeletingEvent = async () => {
        // Todo: Llegar al backend
        try {
            await calendarApi.delete(`/events/${ activeEvent.id }`);
            dispatch( onDeleteEvent() );   
        } catch (error) {
            Swal.fire('Error al eliminar', error.response.data?.msg, 'error' );
        }
    }

    const startLoadingEvent = async () => {
        try {
            const { data } = await calendarApi.get('/events');
            const eventos = convertEventsToDateEvents(data.eventos);
            dispatch( onLoadEvents( eventos ) );
        } catch (error) {
            console.log(`Error cargando eventos ${ error }`);
        }
    }

    return {
        //* Propiedades
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        //* Métodos
        startDeletingEvent,
        setActiveEvent,
        startSavingEvent,
        startLoadingEvent
    }
}
