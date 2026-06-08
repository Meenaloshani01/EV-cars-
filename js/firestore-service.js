import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { app } from "./script.js";

const db = getFirestore(app);

// Save user profile data to Firestore
export async function saveUserProfile(userId, profileData) {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    return { success: true, message: "Profile saved successfully" };
  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error: error.message };
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId, updates) {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

// Save trip/ride data
export async function saveTripData(userId, tripData) {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "trips"), {
      ...tripData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving trip:", error);
    return { success: false, error: error.message };
  }
}

// Get user trips
export async function getUserTrips(userId) {
  try {
    const querySnapshot = await getDocs(collection(db, "users", userId, "trips"));
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}

export { db };