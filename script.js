const cartoes = document.querySelectorAll(".card-nav");

cartoes.forEach((cartao) => {
  cartao.addEventListener("click", () => {
    cartoes.forEach((item) => {
      item.classList.remove("ativo");
    });

    cartao.classList.add("ativo");
  });
});
