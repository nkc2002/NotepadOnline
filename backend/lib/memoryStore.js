// In-memory store for development without MongoDB
const users = new Map();
const notes = new Map();

let userIdCounter = 1;
let noteIdCounter = 1;

export const memoryStore = {
  // Users
  users: {
    create: async (userData) => {
      const id = `user_${userIdCounter++}`;
      const user = {
        _id: id,
        id,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(id, user);
      return user;
    },

    findOne: async (query) => {
      for (const user of users.values()) {
        if (query.email && user.email === query.email) {
          return user;
        }
        if (query._id && user._id === query._id) {
          return user;
        }
      }
      return null;
    },

    findById: async (id) => {
      return users.get(id) || null;
    },
  },

  // Notes
  notes: {
    create: async (noteData) => {
      const id = `note_${noteIdCounter++}`;
      const note = {
        _id: id,
        id,
        ...noteData,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      notes.set(id, note);
      return note;
    },

    find: async (query) => {
      const results = [];
      for (const note of notes.values()) {
        let match = true;

        if (query.owner && note.owner !== query.owner) {
          match = false;
        }
        if (query.shareId && note.shareId !== query.shareId) {
          match = false;
        }
        if (query.isPublic !== undefined && note.isPublic !== query.isPublic) {
          match = false;
        }

        if (match) {
          results.push(note);
        }
      }
      return results;
    },

    findOne: async (query) => {
      for (const note of notes.values()) {
        if (query._id && note._id === query._id) {
          return note;
        }
        if (query.shareId && note.shareId === query.shareId) {
          return note;
        }
      }
      return null;
    },

    findById: async (id) => {
      return notes.get(id) || null;
    },

    update: async (id, updates) => {
      const note = notes.get(id);
      if (!note) return null;

      Object.assign(note, updates, { updatedAt: new Date() });
      notes.set(id, note);
      return note;
    },

    delete: async (id) => {
      return notes.delete(id);
    },
  },

  // Clear all data
  clear: () => {
    users.clear();
    notes.clear();
    userIdCounter = 1;
    noteIdCounter = 1;
  },
};

export default memoryStore;
