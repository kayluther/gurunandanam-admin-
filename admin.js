import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// ⚠️ PASTE YOUR FIREBASE CONFIG HERE ⚠️
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA4UENoBAfebqT8JKONiYNV0VrUnM7AcZs",
  authDomain: "gurunandanam-stores.firebaseapp.com",
  projectId: "gurunandanam-stores",
  storageBucket: "gurunandanam-stores.firebasestorage.app",
  messagingSenderId: "351764557633",
  appId: "1:351764557633:web:316a01dcdc644d8df6bbc0",
  measurementId: "G-FXBQH2Y30D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get HTML Elements
const addForm = document.getElementById('addItemForm');
const adminProductList = document.getElementById('admin-product-list');
const adminSearchInput = document.getElementById('adminSearchInput'); 
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Variables
let allAdminProducts = []; 
let editingId = null; // Keeps track of the item being edited

// 1. Fetch Inventory from Firebase
async function loadAdminProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        allAdminProducts = [];
        
        querySnapshot.forEach((doc) => {
            allAdminProducts.push({ id: doc.id, ...doc.data() });
        });

        // Sort alphabetically by name
        allAdminProducts.sort((a, b) => a.name.localeCompare(b.name));
        
        // Filter based on whatever is typed in the search bar
        const currentSearchTerm = adminSearchInput.value.toLowerCase();
        const filteredProducts = allAdminProducts.filter(p => p.name.toLowerCase().includes(currentSearchTerm));
        
        displayAdminProducts(filteredProducts);
    } catch (error) {
        console.error("Error fetching data: ", error);
        adminProductList.innerHTML = "<li class='loading'>Error connecting to database. Please refresh.</li>";
    }
}

// 2. Display Items on the Screen
function displayAdminProducts(productsToDisplay) {
    adminProductList.innerHTML = '';
    
    if(productsToDisplay.length === 0) {
        adminProductList.innerHTML = "<li>No items match your search.</li>";
        return;
    }

    productsToDisplay.forEach((data) => {
        const li = document.createElement('li');
        const formattedPrice = data.price.toLocaleString('en-IN');
        
        li.innerHTML = `
            <div class="item-info">
                <span class="item-name">${data.name}</span>
                <span class="item-price">₹${formattedPrice}</span>
            </div>
            <div class="action-buttons">
                <button class="edit-btn" data-id="${data.id}" data-name="${data.name}" data-price="${data.price}">Edit</button>
                <button class="delete-btn" data-id="${data.id}">Remove</button>
            </div>
        `;
        adminProductList.appendChild(li);
    });

    // Attach functionality to Remove buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm('Are you sure you want to completely remove this item?')) {
                e.target.innerText = "Removing...";
                e.target.style.opacity = "0.5";
                const id = e.target.getAttribute('data-id');
                await deleteDoc(doc(db, "products", id));
                loadAdminProducts(); 
            }
        });
    });

    // Attach functionality to Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editingId = e.target.getAttribute('data-id');
            const currentName = e.target.getAttribute('data-name');
            const currentPrice = e.target.getAttribute('data-price');

            // Put current data into the input boxes
            document.getElementById('itemName').value = currentName;
            document.getElementById('itemPrice').value = currentPrice;

            // Change UI to Edit Mode
            formTitle.innerText = "Edit Item";
            submitBtn.innerText = "Update Item";
            cancelEditBtn.style.display = "block";

            // Scroll up to the form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// 3. Reset the form back to Add Mode
function resetFormMode() {
    addForm.reset();
    editingId = null;
    formTitle.innerText = "Add New Item";
    submitBtn.innerText = "Add to Inventory";
    cancelEditBtn.style.display = "none";
}

// Cancel Edit Button click
cancelEditBtn.addEventListener('click', resetFormMode);

// 4. Live Search function
adminSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allAdminProducts.filter(p => p.name.toLowerCase().includes(term));
    displayAdminProducts(filtered);
});

// 5. Add OR Update Item (Form Submit)
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    
    submitBtn.style.opacity = "0.7";

    try {
        if (editingId) {
            // WE ARE EDITING AN ITEM
            submitBtn.innerText = "Updating...";
            await updateDoc(doc(db, "products", editingId), {
                name: name,
                price: Number(price)
            });
        } else {
            // WE ARE ADDING A NEW ITEM
            submitBtn.innerText = "Adding...";
            await addDoc(collection(db, "products"), {
                name: name,
                price: Number(price)
            });
        }
        
        resetFormMode(); // Reset the UI
        adminSearchInput.value = ''; // Clear search bar
        loadAdminProducts(); // Refresh list to show updates

    } catch (error) {
        console.error("Error saving document: ", error);
        alert("Error saving item. Please try again.");
    } finally {
        submitBtn.style.opacity = "1";
    }
});

// Load everything when the page opens
loadAdminProducts();
