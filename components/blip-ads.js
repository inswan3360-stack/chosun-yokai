class BlipAds extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const type = this.getAttribute('type') || 'display';
        const slot = this.getAttribute('slot-id') || 'auto';
        
        this.render(type, slot);
    }

    render(type, slot) {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                margin: 40px 0;
                text-align: center;
            }
            .ad-container {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                min-height: 100px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            .ad-label {
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 1px;
                opacity: 0.3;
                color: var(--ice, #fff);
            }
            .ad-placeholder {
                font-family: 'Outfit', sans-serif;
                color: rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                font-weight: 700;
                letter-spacing: 2px;
            }
            /* Actual AdSense Slot Styles */
            .adsbygoogle {
                display: block;
                width: 100%;
            }
        </style>
        <div class="ad-container">
            <span class="ad-label">Advertisement</span>
            
            <!-- Placeholder for AdSense -->
            <div class="ad-placeholder">
                DIGITAL SANCTUARY AD SLOT [${slot}]
            </div>

            <!-- Future AdSense Code Injection Point -->
            <!-- 
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="${slot}"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
            -->
        </div>
        `;
    }
}

customElements.define('blip-ads', BlipAds);
