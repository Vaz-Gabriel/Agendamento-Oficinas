document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schedulingForm');
    const dateInput = document.getElementById('data');
    const successMessage = document.getElementById('successMessage');
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeText = document.getElementById('theme-text');

    // --- Lógica de Modo Dark/Light ---
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeText.textContent = "Modo Claro";
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeText.textContent = "Modo Escuro";
            localStorage.setItem('theme', 'light');
        }    
    }

    toggleSwitch.addEventListener('change', switchTheme, false);

    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
            themeText.textContent = "Modo Claro";
        }
    }

    // --- Lógica de Data (Bloquear hoje e retroativas) ---
    function setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        
        const minDateString = `${year}-${month}-${day}`;
        dateInput.setAttribute('min', minDateString);
    }
    
    setMinDate();

    // --- Lógica de Envio ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const unidade = document.getElementById('unidade').value;
        const placa = document.getElementById('placa').value;
        const km = document.getElementById('km').value;
        const problema = document.getElementById('problema').value;
        const data = document.getElementById('data').value;

        const selectedDate = new Date(data + 'T00:00:00');
        const today = new Date();
        today.setHours(0,0,0,0);
        
        if (selectedDate <= today) {
            alert("Erro: Só são aceitos agendamentos com no mínimo 1 dia de antecedência.");
            return;
        }

        const dataFormatada = data.split('-').reverse().join('/');

        // Mensagem formatada para WhatsApp (usando encodeURIComponent para segurança total)
        const textoMensagem = `*Novo Agendamento - Unidas*\n` +
            `----------------------------\n` +
            `*Unidade:* ${unidade}\n` +
            `*Placa:* ${placa}\n` +
            `*KM Atual:* ${km}\n` +
            `*Problema:* ${problema}\n` +
            `*Data:* ${dataFormatada}\n` +
            `----------------------------`;

        const numeroWhatsApp = "5517996468743";
        
        // Formato wa.me é o mais recomendado e moderno para redirecionamento direto
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensagem)}`;

        // Mostrar mensagem de sucesso
        successMessage.classList.remove('hidden');
        
        // Tentar abrir em nova aba primeiro (comportamento padrão mais seguro)
        // Se falhar ou o usuário preferir, o redirecionamento ocorre.
        const win = window.open(url, '_blank');
        
        // Se o bloqueador de popups impedir o window.open, usamos o location.href como fallback imediato
        if (!win || win.closed || typeof win.closed == 'undefined') {
            window.location.href = url;
        }

        // Resetar formulário após o envio
        setTimeout(() => {
            form.reset();
            setMinDate();
            // Mantemos a mensagem de sucesso visível por um tempo
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        }, 1000);
    });
});
