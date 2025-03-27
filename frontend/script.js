
document.getElementById("search").addEventListener("click", async () => {
    const keyword = document.getElementById("keyword").value;
    if (!keyword) {
        alert("Por favor, insira um termo de busca.");
        return;
    }

    const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    const data = await response.json();
    console.log(data)
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (data.products.length === 0) {
        resultsDiv.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    data.products.forEach((product) => {
        const productEl = document.createElement("div");
        productEl.classList.add("product");

        productEl.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.title}">
            <div>
                <h3>${product.title}</h3>
                <p><strong>⭐ ${product.rating}</strong> (${product.reviews} avaliações)</p>
            </div>
        `;

        resultsDiv.appendChild(productEl);
    });
});
