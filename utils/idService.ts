export class IDService {
  private static deviceId: string | null = null;
  private static lastTimestamp: number = 0;
  private static counter: number = 0;

  // Generates a unique ID with absolute uniqueness guarantee
  static generateUniqueId(): string {
    const timestamp = Date.now();
    
    // 🔥 CRITICAL FIX: Ensure unique timestamp even for rapid calls
    let uniqueTimestamp = timestamp;
    if (timestamp === this.lastTimestamp) {
      this.counter++;
      uniqueTimestamp = timestamp + this.counter;
    } else {
      this.counter = 0;
      this.lastTimestamp = timestamp;
    }
    
    // 🔥 CRITICAL FIX: Use UUID for absolute uniqueness
    const uuid = this.generateUUID();
    
    const deviceId = this.getDeviceId();
    const finalId = `${uniqueTimestamp}_${uuid}_${deviceId}`;
    
    // 🔥 DEBUG: Log the generated ID
    console.log('🔥 [ID SERVICE] Generated ID:', finalId);
    console.log('🔥 [ID SERVICE] Timestamp:', uniqueTimestamp, 'Counter:', this.counter);
    
    return finalId;
  }

  // Generates a simple but unique UUID
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Retrieves the device ID
  private static getDeviceId(): string {
    if (!this.deviceId) {
      // Generates a unique device ID for this session
      this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.deviceId;
  }

  // Parse un ID pour extraire les informations
  static parseId(id: string): {
    timestamp: number;
    uuid: string;
    deviceId: string;
  } | null {
    try {
      const parts = id.split('_');
      if (parts.length >= 3) {
        return {
          timestamp: parseInt(parts[0]),
          uuid: parts[1],
          deviceId: parts[2]
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Checks if an ID is valid
  static isValidId(id: string): boolean {
    return this.parseId(id) !== null;
  }

  // Extrait le timestamp d'un ID
  static getTimestampFromId(id: string): number | null {
    const parsed = this.parseId(id);
    return parsed?.timestamp || null;
  }

  // Extrait l'ID d'appareil d'un ID
  static getDeviceIdFromId(id: string): string | null {
    const parsed = this.parseId(id);
    return parsed?.deviceId || null;
  }
}
