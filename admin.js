import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ PASTE YOUR FIREBASE CONFIG HERE ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyA4UENoBAfebqT8JKONiYNV0VrUnM7AcZs",
  authDomain: "gurunandanam-stores.firebaseapp.com",
  projectId: "gurunandanam-stores",
  storageBucket: "gurunandanam-stores.firebasestorage.app",
  messagingSenderId: "351764557633",
  appId: "1:351764557633:web:316a01dcdc644d8df6bbc0",
  measurementId: "G-FXBQH2Y30D"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addForm = document.getElementById('addItemForm');
const adminProductList = document.getElementById('admin-product-list');
const adminSearchInput = document.getElementById('adminSearchInput'); 

let allAdminProducts = []; 

async function loadAdminProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    allAdminProducts = [];
    
    querySnapshot.forEach((doc) => {
        allAdminProducts.push({ id: doc.id, ...doc.data() });
    });

    allAdminProducts.sort((a, b) => a.name.localeCompare(b.name));
    
    const currentSearchTerm = adminSearchInput.value.toLowerCase();
    const filteredProducts = allAdminProducts.filter(p => p.name.toLowerCase().includes(currentSearchTerm));
    
    displayAdminProducts(filteredProducts);
}

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
            <button class="delete-btn" data-id="${data.id}">Remove</button>
        `;
        adminProductList.appendChild(li);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm('Are you sure you want to remove this item?')) {
                e.target.innerText = "Removing...";
                const id = e.target.getAttribute('data-id');
                await deleteDoc(doc(db, "products", id));
                loadAdminProducts(); 
            }
        });
    });
}

adminSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allAdminProducts.filter(p => p.name.toLowerCase().includes(term));
    displayAdminProducts(filtered);
});

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const submitBtn = addForm.querySelector('button');
    
    submitBtn.innerText = "Adding...";
    submitBtn.style.opacity = "0.7";

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: Number(price)
        });
        addForm.reset();
        document.getElementById('itemName').focus();
        adminSearchInput.value = ''; 
        loadAdminProducts();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error adding item");
    } finally {
        submitBtn.innerText = "Add to Inventory";
        submitBtn.style.opacity = "1";
    }
});

loadAdminProducts();
