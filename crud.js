let products = JSON.parse(localStorage.getItem('products')) || [];

function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image_link}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="handleImageError(this)">
                ${product.name}
            </td>
            <td>$${product.price}</td>
            <td>${product.product_type}</td>
            <td>
                <button onclick="editProduct(${index})" class="btn btn-sm btn-warning">Edit</button>
                <button onclick="deleteProduct(${index})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        productList.appendChild(row);
    });
}

function handleImageUpload(input) {
    const imagePreview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.innerHTML = `
                <img src="${e.target.result}" 
                     alt="Preview" 
                     style="max-width: 200px; max-height: 200px; object-fit: contain;">
            `;
            document.getElementById('image_link').value = e.target.result;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/50';
}

function saveProduct(event) {
    event.preventDefault();
    const productId = document.getElementById('product-id').value;
    const product = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        image_link: document.getElementById('image_link').value,
        product_type: document.getElementById('product_type').value
    };

    if (productId) {
        // Update existing product
        products[productId] = product;
    } else {
        // Add new product
        products.push(product);
    }

    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

function editProduct(index) {
    const product = products[index];
    document.getElementById('product-id').value = index;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('description').value = product.description;
    document.getElementById('image_link').value = product.image_link;
    document.getElementById('product_type').value = product.product_type;
    
    document.getElementById('imagePreview').innerHTML = `
        <img src="${product.image_link}" 
             alt="Preview" 
             style="max-width: 200px; max-height: 200px; object-fit: contain;"
             onerror="handleImageError(this)">
    `;
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts();
    }
}

// Event Listeners
document.getElementById('product-form').addEventListener('submit', saveProduct);
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize the display
displayProducts();