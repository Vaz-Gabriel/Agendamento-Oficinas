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

    // --- Lista de Feriados Nacionais (Brasil) ---
    function getFeriados(year) {
        return [
            `${year}-01-01`, // Confraternização Universal
            `${year}-04-21`, // Tiradentes
            `${year}-05-01`, // Dia do Trabalho
            `${year}-09-07`, // Independência do Brasil
            `${year}-10-12`, // Nossa Senhora Aparecida
            `${year}-11-02`, // Finados
            `${year}-11-15`, // Proclamação da República
            `${year}-11-20`, // Dia da Consciência Negra
            `${year}-12-25`, // Natal
        ];
    }

    // --- Lógica de Data (Bloquear hoje, retroativas, fins de semana e feriados) ---
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

    // Validação em tempo real ao mudar a data
    dateInput.addEventListener('change', function() {
        const dateValue = this.value;
        if (!dateValue) return;

        const selectedDate = new Date(dateValue + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado
        const year = selectedDate.getFullYear();
        const feriados = getFeriados(year);

        // Verificar se é fim de semana
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            alert("Não é permitido agendar em sábados ou domingos. Por favor, escolha um dia útil.");
            this.value = '';
            return;
        }

        // Verificar se é feriado
        if (feriados.includes(dateValue)) {
            alert("A data selecionada é um feriado nacional. Por favor, escolha um dia útil.");
            this.value = '';
            return;
        }
    });

    // --- Lógica de Envio ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const unidade = document.getElementById('unidade').value;
        const placa = document.getElementById('placa').value;
        const km = document.getElementById('km').value;
        const problema = document.getElementById('problema').value;
        const data = document.getElementById('data').value;

        if (!data) {
            alert("Por favor, selecione uma data válida.");
            return;
        }

        const selectedDate = new Date(data + 'T00:00:00');
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Validação de antecedência
        if (selectedDate <= today) {
            alert("Erro: Só são aceitos agendamentos com no mínimo 1 dia de antecedência.");
            return;
        }

        // Validação extra de fim de semana no submit
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            alert("Não é permitido agendar em sábados ou domingos.");
            return;
        }

        // Validação extra de feriado no submit
        const feriados = getFeriados(selectedDate.getFullYear());
        if (feriados.includes(data)) {
            alert("A data selecionada é um feriado nacional.");
            return;
        }

        const dataFormatada = data.split('-').reverse().join('/');

        // Mensagem formatada para WhatsApp
        const textoMensagem = `*Novo Agendamento - Unidas*\n` +
            `----------------------------\n` +
            `*Unidade:* ${unidade}\n` +
            `*Placa:* ${placa}\n` +
            `*KM Atual:* ${km}\n` +
            `*Problema:* ${problema}\n` +
            `*Data:* ${dataFormatada}\n` +
            `----------------------------`;

        const numeroWhatsApp = "5517996468743";
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensagem)}`;

        // Mostrar mensagem de sucesso
        successMessage.classList.remove('hidden');
        
        const win = window.open(url, '_blank');
        if (!win || win.closed || typeof win.closed == 'undefined') {
            window.location.href = url;
        }

        // Resetar formulário após o envio
        setTimeout(() => {
            form.reset();
            setMinDate();
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        }, 1000);
    });
});
