document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERANSLARI ---
    const body = document.body;
    const normalModeSection = document.getElementById('normal-mode');
    const feedbackSection = document.getElementById('feedback-section');
    const blackScreenOverlay = document.getElementById('black-screen-overlay');
    const infoScreen = document.getElementById('info-screen');
    const startBattleBtn = document.getElementById('start-battle-btn');
    const battleScreen = document.getElementById('battle-screen');
    const enemySprite = document.getElementById('enemy-sprite');
    const enemyDialogueBox = document.getElementById('enemy-dialogue-box');
    const enemyDialogueContent = document.getElementById('enemy-dialogue-content');
    const interactionBox = document.getElementById('interaction-box');
    const interactionContent = document.getElementById('interaction-content');
    const fightMinigameBox = document.getElementById('fight-minigame-box');
    const fightLine = document.getElementById('fight-line');
    const mainUiBar = document.getElementById('main-ui-bar');
    const heartSelector = document.getElementById('heart-selector');
    const hpBar = document.getElementById('hp-bar-ui');
    const actionButtons = document.querySelectorAll('.action-btn-text');

    // --- SESLER ---
    const tvSound = document.getElementById('sound-tv');
    const metalSound = document.getElementById('sound-metal');
    const punchSound = document.getElementById('sound-punch');
    const dialogueSound = document.getElementById('sound-dialogue');

    // --- OYUN DURUMU ---
    let battleState = {};
    let gameLoopId = null; // Animasyon döngüsü için
    let activeKeys = new Set(); // Aynı anda basılan tuşları takip etmek için

    const enemyDialogues = [ "Emeklerime laf edemezsin!", "Her şey senin elinde fakat uzatıyorsun.", "Bana bunu nasıl yaparsın?!", "Saygısızlığının bir sınırı yok mu?", "Benimle alay mı ediyorsun?", "Uğraşlarım boşa mı gidecek?", "Hala anlamadın mı, yaptığın yanlış?", "Canımı yakmaya devam edeceksin öyle mi?", "Bitir şu işi artık!", "Ben böyle bir muameleyi hak etmiyorum!", "Ne kadar ileri gideceksin?" ];

    // --- SİTE AKIŞI (Değişiklik yok) ---
    document.getElementById('good-feedback').addEventListener('click', () => alert('Teşekkürler!'));
    document.getElementById('bad-feedback').addEventListener('click', startCursedSequence);
    function startCursedSequence() { document.getElementById('feedback-text').textContent = 'geri bildiriminiz için teş-'; setTimeout(() => { document.querySelectorAll('h1, .mod-card').forEach(el => el.classList.add('glitch')); setTimeout(() => { document.querySelectorAll('.mod-card').forEach(card => card.classList.add('fade-out')); setTimeout(() => { blackScreenOverlay.classList.remove('hidden'); setTimeout(() => { document.getElementById('main-title').textContent = '666'; document.getElementById('mods-container').innerHTML = Array(4).fill('<div class="mod-card"><h2>666</h2><p>666</p><div class="download-btn">666</div></div>').join(''); document.querySelectorAll('.glitch').forEach(el => el.classList.remove('glitch')); initDevilMode(); }, 50); }, 800); }, 1000); }, 500); }
    function initDevilMode() { blackScreenOverlay.classList.add('hidden'); feedbackSection.classList.add('hidden'); body.className = 'devil-mode'; document.querySelectorAll('.download-btn, .mod-card h2, .mod-card p').forEach(btn => { btn.textContent = '666'; if (btn.classList.contains('download-btn')) { btn.addEventListener('click', (e) => { e.preventDefault(); showInfoScreen(); }); } }); }
    function showInfoScreen() { normalModeSection.classList.add('hidden'); tvSound.play(); infoScreen.classList.remove('hidden'); document.getElementById('info-data').innerHTML = [`> ERİŞİM SAĞLANIYOR...`, `> KULLANICI IP ADRESİ: 188.59.104.72`, `> AĞ TARAMASI BAŞLATILDI...`, `> DONANIM KİMLİĞİ: ${navigator.platform.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`, `> DOSYA SİSTEMİ OKUNUYOR...`, `> LOKASYON VERİLERİ DOĞRULANDI. GÖZETİM AKTİF.`].join('\n'); startBattleBtn.addEventListener('click', initBattle); }

    // --- SAVAŞ MEKANİKLERİ ---
    function initBattle() { tvSound.pause(); infoScreen.classList.add('hidden'); normalModeSection.classList.add('hidden'); body.className = 'battle-mode'; battleScreen.classList.remove('hidden'); resetBattleState(); updateUI(); document.addEventListener('keydown', handleKeyPress); document.addEventListener('keyup', (e) => activeKeys.delete(e.key)); metalSound.play(); typeTo(interactionContent, `* Televizyon sana anlamsızca bakıyor.`, () => battleState.turn = 'PLAYER_CHOICE'); }
    function resetBattleState() { battleState = { turn: 'DIALOGUE', menu: 'main', player: { hp: 20, maxHp: 20, baseDamage: 10, heartSpeed: 4, heartPos: { x: 0, y: 0 }, inventory: { su: 5, para: 10, canta: 1, dankek: 2 }, effects: { invulnerableTurns: 0 } }, enemy: { hp: 8000, maxHp: 8000, mood: 'neutral', attack: 3, defense: 1.0, }, selectedActionIndex: 0, selectedSubMenuIndex: 0, enemyAttackCounter: 0, projectiles: [] }; }
    
    // --- KLAVYE KONTROL ---
    function handleKeyPress(e) {
        if (battleState.turn === 'PLAYER_DODGE') { activeKeys.add(e.key); return; }
        if (battleState.turn === 'DIALOGUE') return;
        if (battleState.turn === 'MINIGAME' && (e.key === 'z' || e.key === 'Enter' || e.key === ' ')) { endFightMinigame(); return; }
        if (battleState.turn === 'PLAYER_CHOICE' || battleState.turn === 'SUB_MENU') {
            switch (e.key) {
                case 'ArrowRight': navigateMenu(1); break; case 'ArrowLeft': navigateMenu(-1); break;
                case 'ArrowUp': navigateMenu(-1); break; case 'ArrowDown': navigateMenu(1); break;
                case 'Enter': case 'z': selectMenuOption(); break; case 'x': goBack(); break;
            }
        }
    }

    // --- DÜŞMAN SALDIRI SEKANSI ---
    function startEnemyTurn() {
        battleState.turn = 'ENEMY_TURN';
        if (battleState.enemy.mood === 'calm') { typeTo(interactionContent, "* Televizyon sana bakıyor, hamle sırası sende.", () => { battleState.turn = 'PLAYER_CHOICE'; battleState.menu = 'main'; }); return; }
        if (battleState.player.effects.invulnerableTurns > 0) { battleState.player.effects.invulnerableTurns--; typeTo(interactionContent, "* Çanta sayesinde hasar almadın!", () => { battleState.turn = 'PLAYER_CHOICE'; battleState.menu = 'main'; }); return; }

        const dialogue = enemyDialogues[battleState.enemyAttackCounter] || "Sana olan öfkem kelimelere sığmıyor!";
        battleState.enemyAttackCounter++;
        
        typeTo(enemyDialogueContent, dialogue, () => {
            // Diyalog sonrası saldırı seçimi ve kaçış fazını başlat
            let attackType;
            if (battleState.enemy.mood === 'angry') {
                attackType = 'bars'; // Sinirliyken her zaman çubuk fırlatır
            } else {
                // Rastgele olarak nokta veya kırmızı alan saldırısı seç
                attackType = Math.random() < 0.5 ? 'dots' : 'zones';
            }
            startPlayerDodgePhase(attackType);
        }, enemyDialogueBox);
    }
    
    function startPlayerDodgePhase(attackType) {
        battleState.turn = 'PLAYER_DODGE';
        interactionContent.innerHTML = ''; // Yazıları temizle
        mainUiBar.style.opacity = '0'; // UI'ı gizle
        enemyDialogueBox.classList.add('hidden'); // Diyalog kutusunu gizle

        // Kalbi savaş alanının ortasına taşı
        interactionBox.appendChild(heartSelector);
        const boxRect = interactionBox.getBoundingClientRect();
        battleState.player.heartPos = {
            x: boxRect.width / 2 - heartSelector.offsetWidth / 2,
            y: boxRect.height / 2 - heartSelector.offsetHeight / 2,
        };

        // Arena div'ini oluştur (saldırı elementleri bunun içinde olacak)
        const arena = document.createElement('div');
        arena.id = 'attack-arena';
        interactionBox.appendChild(arena);

        // Saldırıya göre hazırlık yap
        if (attackType === 'zones') setupAttack_Zones(arena);
        if (attackType === 'bars') setupAttack_Bars(arena);
        if (attackType === 'dots') setupAttack_Dots(arena);

        // Oyun döngüsünü başlat
        gameLoopId = requestAnimationFrame(gameLoop);

        // 10 saniye sonra fazı bitir
        setTimeout(() => {
            endPlayerDodgePhase(arena);
        }, 10000);
    }

    function endPlayerDodgePhase(arena) {
        cancelAnimationFrame(gameLoopId); // Döngüyü durdur
        gameLoopId = null;
        arena.remove(); // Saldırı elementlerini temizle
        battleState.projectiles = []; // Mermileri temizle
        activeKeys.clear();

        mainUiBar.appendChild(heartSelector); // Kalbi eski yerine taşı
        mainUiBar.style.opacity = '1'; // UI'ı göster
        updateUI(); // Kalp pozisyonunu ve HP'yi güncelle
        
        if (battleState.player.hp <= 0) {
            endBattle('lose');
        } else {
            typeTo(interactionContent, "* Hamle sırası sende.", () => {
                battleState.turn = 'PLAYER_CHOICE';
                battleState.menu = 'main';
            });
        }
    }

    // --- OYUN DÖNGÜSÜ VE HAREKET ---
    function gameLoop() {
        if (battleState.turn !== 'PLAYER_DODGE') return;

        // Kalp hareketini yönet
        handleHeartMovement();

        // Mermileri hareket ettir ve çarpışmaları kontrol et
        const heartRect = heartSelector.getBoundingClientRect();
        battleState.projectiles.forEach((p, index) => {
            // Mermiyi hareket ettir
            p.x += p.vx;
            p.y += p.vy;
            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;

            // Çarpışma kontrolü
            const projRect = p.element.getBoundingClientRect();
            if (rectsOverlap(heartRect, projRect)) {
                dealDamage(p.damage);
                p.element.remove();
                battleState.projectiles.splice(index, 1);
            }
            // Ekran dışına çıkan mermiyi sil
            else if (p.x < -50 || p.x > interactionBox.offsetWidth || p.y < -50 || p.y > interactionBox.offsetHeight) {
                 p.element.remove();
                 battleState.projectiles.splice(index, 1);
            }
        });

        if (battleState.player.hp > 0) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    function handleHeartMovement() {
        const speed = battleState.player.heartSpeed;
        if (activeKeys.has('ArrowUp')) battleState.player.heartPos.y -= speed;
        if (activeKeys.has('ArrowDown')) battleState.player.heartPos.y += speed;
        if (activeKeys.has('ArrowLeft')) battleState.player.heartPos.x -= speed;
        if (activeKeys.has('ArrowRight')) battleState.player.heartPos.x += speed;

        // Sınırları kontrol et
        const boxRect = interactionBox.getBoundingClientRect();
        battleState.player.heartPos.x = Math.max(0, Math.min(boxRect.width - heartSelector.offsetWidth, battleState.player.heartPos.x));
        battleState.player.heartPos.y = Math.max(0, Math.min(boxRect.height - heartSelector.offsetHeight, battleState.player.heartPos.y));
        
        heartSelector.style.left = `${battleState.player.heartPos.x}px`;
        heartSelector.style.top = `${battleState.player.heartPos.y}px`;
    }

    function dealDamage(amount) {
        battleState.player.hp -= amount;
        if (battleState.player.hp < 0) battleState.player.hp = 0;
        updateUI();
        if (battleState.player.hp <= 0) {
            // Oyuncu ölürse döngü endPlayerDodgePhase içinde durdurulacak
        }
    }

    // --- SALDIRI KURULUM FONKSİYONLARI ---

    function setupAttack_Zones(arena) {
        const leftZone = document.createElement('div');
        leftZone.className = 'attack-zone left';
        const rightZone = document.createElement('div');
        rightZone.className = 'attack-zone right';
        arena.appendChild(leftZone);
        arena.appendChild(rightZone);

        let isLeftActive = true;
        const intervalId = setInterval(() => {
            if (battleState.turn !== 'PLAYER_DODGE') {
                clearInterval(intervalId);
                return;
            }
            leftZone.classList.toggle('active', isLeftActive);
            rightZone.classList.toggle('active', !isLeftActive);

            const heartX = battleState.player.heartPos.x;
            const boxWidth = interactionBox.offsetWidth;
            if ((isLeftActive && heartX < boxWidth / 2) || (!isLeftActive && heartX > boxWidth / 2)) {
                dealDamage(2); // Her saniye kırmızı alandaysa 2 hasar
            }

            isLeftActive = !isLeftActive;
        }, 1000); // Saniyede bir taraf değiştir
    }
    
    function setupAttack_Bars(arena) {
        const intervalId = setInterval(() => {
            if (battleState.turn !== 'PLAYER_DODGE') {
                clearInterval(intervalId);
                return;
            }
            // Her 250ms'de bir mermi oluştur
            createProjectile('bar', 5, arena);
        }, 250);
    }
    
    function setupAttack_Dots(arena) {
        const intervalId = setInterval(() => {
            if (battleState.turn !== 'PLAYER_DODGE' || battleState.projectiles.length >= 30) {
                clearInterval(intervalId);
                return;
            }
            // Saniyede 3 nokta (her 333ms'de bir)
            const dot = createProjectile('dot', 2, arena);
            // Noktaları kalbe doğru yönlendir (homing)
            const updateDotDirection = () => {
                if (!dot.element.parentElement) return; // Eğer nokta silindiyse dur
                const angle = Math.atan2(battleState.player.heartPos.y - dot.y, battleState.player.heartPos.x - dot.x);
                dot.vx = Math.cos(angle) * 2; // Hızını ayarla
                dot.vy = Math.sin(angle) * 2;
                setTimeout(updateDotDirection, 500); // Yönünü yarım saniyede bir güncelle
            };
            updateDotDirection();

        }, 333);
    }
    
    function createProjectile(type, damage, arena) {
        const p = {
            element: document.createElement('div'),
            x: 0, y: 0, vx: 0, vy: 0, damage: damage
        };
        p.element.className = `projectile ${type}`;

        // Mermiyi rastgele bir kenardan başlat
        const side = Math.floor(Math.random() * 4);
        const boxRect = interactionBox.getBoundingClientRect();
        switch(side) {
            case 0: // Top
                p.x = Math.random() * boxRect.width; p.y = -20;
                break;
            case 1: // Right
                p.x = boxRect.width + 20; p.y = Math.random() * boxRect.height;
                break;
            case 2: // Bottom
                p.x = Math.random() * boxRect.width; p.y = boxRect.height + 20;
                break;
            case 3: // Left
                p.x = -20; p.y = Math.random() * boxRect.height;
                break;
        }

        // Mermiyi kalbin başlangıç pozisyonuna doğru fırlat
        const angle = Math.atan2((boxRect.height / 2) - p.y, (boxRect.width / 2) - p.x);
        const speed = type === 'bar' ? 5 : 2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        
        p.element.style.left = `${p.x}px`;
        p.element.style.top = `${p.y}px`;
        arena.appendChild(p.element);
        battleState.projectiles.push(p);
        return p;
    }

    function rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
    }

    // --- ARAYÜZ, AKSİYON VE MENÜ FONKSİYONLARI (Az Değişiklikle Aynı Kaldı) ---
    function updateUI() {
        const hpPercentage = (battleState.player.hp / battleState.player.maxHp) * 100;
        hpBar.style.width = `${hpPercentage}%`;
        
        // Sadece menü modundayken kalp pozisyonunu güncelle
        if (battleState.turn === 'PLAYER_CHOICE' || battleState.turn === 'SUB_MENU') {
            const selectedBtn = actionButtons[battleState.selectedActionIndex];
            if (selectedBtn) {
                 actionButtons.forEach(btn => btn.classList.remove('selected'));
                 selectedBtn.classList.add('selected');
                 heartSelector.style.left = `${selectedBtn.offsetLeft - 30}px`;
                 heartSelector.style.top = '50%'; // Dikey pozisyonu sıfırla
            }
        }
       
        const options = interactionContent.querySelectorAll('.submenu-option');
        if (options.length > 0) {
            options.forEach((opt, index) => { opt.classList.toggle('selected', index === battleState.selectedSubMenuIndex); });
            const descEl = document.getElementById('item-description');
            if (descEl) { const selectedOpt = options[battleState.selectedSubMenuIndex]; descEl.textContent = selectedOpt ? (selectedOpt.description || '') : ''; }
        }
    }
    
    async function typeTo(element, text, onComplete, containerToShow) {
        if(containerToShow) containerToShow.classList.remove('hidden');
        element.innerHTML = '';
        if (battleState.turn !== 'END') { // Savaş bitmediyse diyalog sesini çal
            dialogueSound.currentTime = 0;
            dialogueSound.play();
        }
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text[i];
            await new Promise(res => setTimeout(res, 40));
        }
        dialogueSound.pause();
        await new Promise(res => setTimeout(res, 300));
        if(onComplete) onComplete();
    }
    
    function endBattle(outcome) {
        metalSound.pause();
        battleState.turn = 'END';
        let msg = "Yenildin...";
        if (outcome === 'win') msg = "Kazandın!";
        if (outcome === 'win_pacifist') msg = "Onu bağışladın. Sorunu çözdün, aferin!";
        typeTo(interactionContent, msg, () => setTimeout(() => window.location.reload(), 5000));
    }
    
    // Fonksiyonlar (handlePlayerAction, showItemMenu, useItem vb.) büyük ölçüde aynı kalmıştır,
    // sadece startEnemyTurn çağrısı artık yeni sistemi tetiklemektedir.
    function navigateMenu(direction) { if (battleState.menu === 'main') { battleState.selectedActionIndex = (battleState.selectedActionIndex + direction + actionButtons.length) % actionButtons.length; } else { const options = interactionContent.querySelectorAll('.submenu-option'); if (options.length === 0) return; battleState.selectedSubMenuIndex = (battleState.selectedSubMenuIndex + direction + options.length) % options.length; } updateUI(); }
    function goBack() { if (battleState.menu !== 'main') { battleState.menu = 'main'; battleState.turn = 'PLAYER_CHOICE'; interactionContent.innerHTML = ''; updateUI(); } }
    function selectMenuOption() { const selectedOption = interactionContent.querySelector('.submenu-option.selected'); if (battleState.menu === 'main') { handlePlayerAction(actionButtons[battleState.selectedActionIndex].dataset.action); } else if (selectedOption && selectedOption.callback) { selectedOption.callback(); } }
    function handlePlayerAction(action) { battleState.turn = 'SUB_MENU'; battleState.selectedSubMenuIndex = 0; switch (action) { case 'FIGHT': if (battleState.enemy.mood === 'calm') { typeTo(interactionContent, "* Bunu hakettin...", () => { battleState.player.hp = 0; endBattle('lose'); }); return; } battleState.menu = 'fight_target'; showSubMenu([{ name: "Televizyon", callback: startFightMinigame }]); break; case 'ACT': battleState.menu = 'act'; showSubMenu([ { name: "Sinirlendir", desc: "Savunmasını düşürür, saldırısını arttırır.", callback: () => act('angry') }, { name: "Üz", desc: "Savunmasını ve saldırısını düşürür.", callback: () => act('sad') }, { name: "Ger", desc: "Ortamı gerer, müzik kesilir.", callback: () => act('tense') }, { name: "Sakinleştir", desc: "Sana saldırmayı bırakır.", callback: () => act('calm') }, ]); break; case 'ITEM': battleState.menu = 'item'; showItemMenu(); break; case 'MERCY': battleState.turn = 'PLAYER_CHOICE'; if (battleState.enemy.mood === 'calm') { endBattle('win_pacifist'); } else { typeTo(interactionContent, "* Televizyon henüz bağışlanmak istemiyor.", startEnemyTurn); } break; } }
    function showItemMenu() { const items = battleState.player.inventory; const options = []; if (items.su > 0) options.push({ name: `Su x${items.su}`, desc: "Fırlatıldığında 130 hasar verir ve düşmanı bozar.", callback: useItemSu }); if (items.para > 0) options.push({ name: `Para x${items.para}`, desc: "Fırlatıldığında 55 hasar verir.", callback: useItemPara }); if (items.canta > 0) options.push({ name: `Çanta x${items.canta}`, desc: "Kullanıldığında 1 tur hasar almanı engeller.", callback: useItemCanta }); if (items.dankek > 0) options.push({ name: `Dankek x${items.dankek}`, desc: "110 can yeniler.", callback: useItemDankek }); if (options.length === 0) options.push({ name: "Boş", desc: "Hiç eşyan kalmamış.", callback: goBack }); showSubMenu(options); }
    function useItemSu() { showSubMenu([ { name: "Fırlat", desc: "130 Hasar", callback: () => { battleState.player.inventory.su--; tvSound.play(); setTimeout(() => tvSound.pause(), 1500); battleState.enemy.hp -= 130; typeTo(enemyDialogueContent, "NE YAPTIĞINI ZANNEDİYORSUN!", () => { act('angry'); }, enemyDialogueBox); }}, { name: "İç", desc: "Boşa içme.", callback: () => { typeTo(interactionContent, "* Suyu içtin. Hiçbir şey olmadı.", startEnemyTurn)} }, ]); }
    function useItemPara() { battleState.player.inventory.para--; battleState.enemy.hp -= 55; typeTo(interactionContent, "* Paraları fırlattın! 55 hasar verdin.", startEnemyTurn); }
    function useItemCanta() { battleState.player.inventory.canta--; battleState.player.effects.invulnerableTurns = 1; typeTo(interactionContent, "* Çantayı kuşandın! 1 tur hasar almazsın.", startEnemyTurn); } // 2'den 1'e düşürüldü, çünkü artık tur bazlı değil.
    function useItemDankek() { battleState.player.inventory.dankek--; battleState.player.hp = Math.min(battleState.player.maxHp, battleState.player.hp + 110); typeTo(interactionContent, "* Dankek yedin! 110 can yeniledin.", startEnemyTurn); }
    function act(mood) { battleState.enemy.mood = mood; let dialogue = ""; switch (mood) { case 'angry': battleState.enemy.defense = 0.4; battleState.enemy.attack = 5; dialogue = "* Televizyon çok sinirli görünüyor!"; break; case 'sad': battleState.enemy.defense = 1.5; battleState.enemy.attack = 1; dialogue = "* Televizyon üzgün görünüyor..."; break; case 'tense': metalSound.volume = 0; dialogue = "* Ortamdaki gerginlik hissediliyor."; break; case 'calm': metalSound.volume = 0; dialogue = "* Televizyon sakinleşti. Sana saldırmayacak gibi."; break; } typeTo(interactionContent, dialogue, startEnemyTurn); }
    function startFightMinigame() { battleState.turn = 'MINIGAME'; interactionContent.innerHTML = ''; fightMinigameBox.classList.remove('hidden'); fightLine.style.animation = 'sweep 1s linear'; }
    function endFightMinigame() { if (battleState.turn !== 'MINIGAME') return; battleState.turn = 'DIALOGUE'; const lineStyle = window.getComputedStyle(fightLine); const matrix = new WebKitCSSMatrix(lineStyle.transform); const currentX = matrix.m41; const percentage = (currentX / fightMinigameBox.offsetWidth) * 100; fightLine.style.animation = 'none'; const distance_from_center = Math.abs(50 - percentage); let damage; if (distance_from_center <= 5) { damage = battleState.player.baseDamage + 15; } else { const reduction = (distance_from_center / 50) * 0.20; damage = battleState.player.baseDamage * (1 - reduction); } damage = Math.round(damage); punchSound.play(); enemySprite.classList.add('enemy-hit'); setTimeout(() => enemySprite.classList.remove('enemy-hit'), 200); fightMinigameBox.classList.add('hidden'); battleState.enemy.hp -= damage; updateUI(); typeTo(interactionContent, `* ${damage} hasar verdin!`, () => { if (battleState.enemy.hp <= 0) { endBattle('win'); } else { startEnemyTurn(); } }); }
    function showSubMenu(options) { interactionContent.innerHTML = ''; const gridContainer = document.createElement('div'); gridContainer.className = 'submenu-grid'; options.forEach(opt => { const el = document.createElement('div'); el.className = 'submenu-option'; el.textContent = opt.name; el.callback = opt.handler || opt.callback; el.description = opt.desc || ''; gridContainer.appendChild(el); }); interactionContent.appendChild(gridContainer); interactionContent.insertAdjacentHTML('beforeend', `<div id="item-description"></div>`); updateUI(); }
});