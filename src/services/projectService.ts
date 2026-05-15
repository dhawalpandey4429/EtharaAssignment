import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface Project {
  id: string;
  name: string;
  description: string;
  adminId: string;
  memberIds: string[];
  createdAt: any;
  updatedAt?: any;
}

export const projectService = {
  subscribeToUserProjects: (userId: string, callback: (projects: Project[]) => void) => {
    const qUnified = query(
      collection(db, 'projects'),
      where('memberIds', 'array-contains', userId)
    );

    return onSnapshot(qUnified, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
  },

  createProject: async (name: string, description: string, userId: string) => {
    try {
      const projectData = {
        name,
        description,
        adminId: userId,
        memberIds: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  },

  addMember: async (projectId: string, memberEmail: string) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', memberEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userId = querySnapshot.docs[0].id;
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const currentMembers = projectSnap.data().memberIds || [];
          if (!currentMembers.includes(userId)) {
            await updateDoc(projectRef, {
              memberIds: [...currentMembers, userId],
              updatedAt: serverTimestamp(),
            });
          }
        }
      } else {
        alert('User with this email not found. They must sign in to the app first.');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
    }
  }
};
