import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const db = {
  // Add or update donor
  async upsertDonor(phone, name, bloodType, location) {
    const { data, error } = await supabase
      .from('donors')
      .upsert({
        phone,
        name,
        blood_type: bloodType.toUpperCase(),
        location,
        available: true
      }, { 
        onConflict: 'phone',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add patient request
  async addPatient(phone, bloodType, urgent = false) {
    const { data, error } = await supabase
      .from('patients')
      .upsert({
        phone,
        blood_type: bloodType.toUpperCase(),
        urgent
      }, { onConflict: 'phone' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find compatible donors
  async findMatches(patientId) {
    const { data, error } = await supabase
      .from('compatible_matches')
      .select('*')
      .eq('patient_id', patientId)
      .limit(3);
    
    if (error) throw error;
    return data;
  },

  // Create match record
  async createMatch(patientId, donorId) {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        patient_id: patientId,
        donor_id: donorId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export default supabase;