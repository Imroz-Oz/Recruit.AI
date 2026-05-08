import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function wipeData() {
  const usersSnap = await getDocs(collection(db, 'users'));
  for (const docSnap of usersSnap.docs) {
    if (docSnap.id !== 'connection') await deleteDoc(doc(db, 'users', docSnap.id));
  }
  
  const orgsSnap = await getDocs(collection(db, 'organizations'));
  for (const docSnap of orgsSnap.docs) {
    await deleteDoc(doc(db, 'organizations', docSnap.id));
  }

  const candsSnap = await getDocs(collection(db, 'candidates'));
  for (const docSnap of candsSnap.docs) {
    await deleteDoc(doc(db, 'candidates', docSnap.id));
  }
  
  console.log('Successfully deleted all users, organizations, and candidates data.');
}

wipeData().then(() => process.exit(0)).catch(console.error);
