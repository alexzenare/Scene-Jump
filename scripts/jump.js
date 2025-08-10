Hooks.on("ready", () => {
  Hooks.on("hoverToken", (token, hovered) => {
    if (!hovered) return;
    token.mouseInteractionManager.callbacks.clickLeft = async () => {
      const locked = token.document.getFlag("token-scene-jump", "locked");
      if (locked && !game.user.isGM) {
        ui.notifications.warn("Questo passaggio è bloccato.");
        return;
      }
      const targetSceneName = token.document.getFlag("token-scene-jump", "targetScene");
      const targetTokenName = token.document.getFlag("token-scene-jump", "targetToken");
      if (!targetSceneName || !targetTokenName) return;
      const targetScene = game.scenes.find(s => s.name === targetSceneName);
      if (!targetScene) return;
      const targetToken = targetScene.tokens.find(t => t.name === targetTokenName);
      if (!targetToken) return;
      const updates = game.users.players.map(u => {
        const char = u.character;
        if (!char) return null;
        return {
          _id: char.getActiveTokens()[0].id,
          x: targetToken.x,
          y: targetToken.y
        };
      }).filter(Boolean);
      await targetScene.update({ active: true });
      await targetScene.updateEmbeddedDocuments("Token", updates);
    };
    if (game.user.isGM) {
      token.mouseInteractionManager.callbacks.clickRight = async () => {
        const locked = token.document.getFlag("token-scene-jump", "locked");
        await token.document.setFlag("token-scene-jump", "locked", !locked);
        ui.notifications.info(locked ? "Passaggio sbloccato" : "Passaggio bloccato");
      };
    }
  });
});
