// Standalone Widget Script for Shopify Integration
(function() {
  // Check if React is already loaded
  if (!window.React) {
    console.error('React is required for the chatbot widget');
    return;
  }

  // Create a container for the widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'chatbot-widget-root';
  document.body.appendChild(widgetContainer);

  // Import and render the widget
  import('./widget-bundle.js')
    .then(module => {
      const { ChatBotWidget } = module;
      const root = ReactDOM.createRoot(widgetContainer);
      root.render(React.createElement(ChatBotWidget));
    })
    .catch(error => {
      console.error('Failed to load chatbot widget:', error);
    });
})();
