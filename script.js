// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// 🔹 Configura Firebase con tus credenciales
const firebaseConfig = {
    apiKey: "AIzaSyDqg_-LUNcyg7wo2SXKLCdzPsyWZvBlcqM",
    authDomain: "proyecto1-13ec7.firebaseapp.com",
    projectId: "proyecto1-13ec7",
    storageBucket: "proyecto1-13ec7.appspot.com",
    messagingSenderId: "348303377251",
    appId: "1:348303377251:web:6cd56ba99fad464c268956",
    measurementId: "G-JH9VB550E4"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userCollection = collection(db, "usuarios");

// Variable global para identificar si se está editando un usuario
let editingUserId = null;

// 📌 Agregar o Actualizar usuario
document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let lastname = document.getElementById("lastname").value;
    let email = document.getElementById("email").value;
    let age = document.getElementById("age").value;
    let city = document.getElementById("city").value;
    let career = document.getElementById("career").value;

    try {
        if (editingUserId) {
            // 🔹 Si editingUserId tiene un valor, significa que estamos editando
            const docRef = doc(db, "usuarios", editingUserId);
            await updateDoc(docRef, {
                nombre: name,
                apellidos: lastname,
                correo: email,
                edad: age ? parseInt(age) : null,
                ciudad: city,
                carrera: career
            });
            console.log(`Usuario con ID ${editingUserId} actualizado`);
        } else {
            // 🔹 Si editingUserId es null, significa que es un nuevo usuario
            await addDoc(userCollection, { 
                nombre: name, 
                apellidos: lastname,
                correo: email, 
                edad: age ? parseInt(age) : null, 
                ciudad: city,
                carrera: career 
            });
            console.log("Usuario agregado");
        }
        
        // Restablecer formulario y editar usuario a null
        document.getElementById("userForm").reset();
        editingUserId = null;
    } catch (error) {
        console.error("Error al guardar usuario:", error);
    }
});

// 📌 Mostrar usuarios en tiempo real
onSnapshot(userCollection, (snapshot) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    
    snapshot.forEach((documento) => {
        let user = documento.data();
        let li = document.createElement("li");
        li.textContent = `${user.nombre} ${user.apellidos} - ${user.correo} - ${user.edad || "N/A"} años - ${user.ciudad} - ${user.carrera}`;

        // 🔹 Botón eliminar
        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.style.marginTop = "15px"; // 🔹 Más espacio entre botones
        deleteBtn.style.padding = "5px 10px"; // 🔹 Tamaño más cómodo
        deleteBtn.onclick = async () => {
            try {
                await deleteDoc(doc(db, "usuarios", documento.id));
                console.log(`Usuario con ID ${documento.id} eliminado`);
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
            }
        };

        // 🔹 Botón editar
        let editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.style.marginTop = "15px"; // 🔹 Más espacio entre botones
        editBtn.style.padding = "5px 10px"; // 🔹 Tamaño más cómodo
        editBtn.onclick = async () => {
            try {
                const docRef = doc(db, "usuarios", documento.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let userData = docSnap.data();

                    // Llenar formulario con los datos actuales
                    document.getElementById("name").value = userData.nombre;
                    document.getElementById("lastname").value = userData.apellidos;
                    document.getElementById("email").value = userData.correo;
                    document.getElementById("age").value = userData.edad || "";
                    document.getElementById("city").value = userData.ciudad;
                    document.getElementById("career").value = userData.carrera;

                    // Guardar el ID del usuario que estamos editando
                    editingUserId = documento.id;
                } else {
                    console.log("No se encontró el documento.");
                }
            } catch (error) {
                console.error("Error al obtener usuario para editar:", error);
            }
        };

        li.appendChild(deleteBtn);
        li.appendChild(editBtn);
        userList.appendChild(li);
    });
});
