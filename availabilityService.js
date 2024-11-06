// availabilityService.js
import supabase from './supabaseClient';

// Function to create a new event
export async function createEvent(title, description, timezone) {
  const { data, error } = await supabase
    .from('Events')
    .insert([{ title, description, timezone }])
    .select('eventId')
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  return data.eventId;
}

// Function to save or update availability for a time slot
export async function saveAvailability(eventId, timeSlot) {
  console.log("Saving availability for timeSlot:", timeSlot); // Debugging line

  if (!timeSlot) {
    console.error("Error: timeSlot is null or undefined");
    return null;
  }

  const { data, error } = await supabase
    .from('Availability')
    .upsert({ eventId, timeSlot, count: 1 }, { onConflict: ['eventId', 'timeSlot'] })
    .select('*');

  if (error) {
    console.error('Error saving availability:', error);
    return null;
  }
  return data;
}


// Function to fetch group availability for an event
export async function getGroupAvailability(eventId) {
  const { data, error } = await supabase
    .from('Availability')
    .select('timeSlot, count')
    .eq('eventId', eventId);

  if (error) {
    console.error('Error fetching group availability:', error);
    return [];
  }
  return data;
}
