export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthday?: string;
  weight?: number;
  avatar?: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  type: 'vaccine' | 'activity' | 'diet' | 'medical';
  title: string;
  content: string;
  attachments?: string[];
}

export const storage = {
  getPets(): Pet[] {
    return JSON.parse(localStorage.getItem('pets') || '[]');
  },
  savePet(pet: Pet) {
    const pets = this.getPets();
    const index = pets.findIndex(p => p.id === pet.id);
    if (index > -1) pets[index] = pet;
    else pets.push(pet);
    localStorage.setItem('pets', JSON.stringify(pets));
  },
  getHealthRecords(petId: string): HealthRecord[] {
    const all = JSON.parse(localStorage.getItem('health_records') || '[]');
    return all.filter((r: HealthRecord) => r.petId === petId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  saveHealthRecord(record: HealthRecord) {
    const all = JSON.parse(localStorage.getItem('health_records') || '[]');
    all.push(record);
    localStorage.setItem('health_records', JSON.stringify(all));
  }
};
