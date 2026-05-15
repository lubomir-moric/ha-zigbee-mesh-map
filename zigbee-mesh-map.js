import * as d3 from "https://cdn.skypack.dev/d3@7";

const CARD_VERSION = "1.3.0";

const DEFAULTS = {
    link_filter: "parent-child",
    show_lqi_labels: true,
    lqi_format: "both",
    show_node_labels: true,
    coordinator_color: "#DB5228",
    router_color: "#4A90D9",
    router_leaf_color: "#7BAFD4",
    end_device_color: "#97B552",
    node_outline_color: "rgba(0,0,0,0.3)",
    lqi_colors: { 200: "#4CAF50", 150: "#FDD835", 100: "#FB8C00", 50: "#F44336", 0: "#5F5F5F" },
    font_size: 6,
    node_radius: { coordinator: 10, router: 10, router_leaf: 6, end_device: 4 },
    zoom: {
        min: 0.2,
        max: 4,
        initial: "auto"
    },
    layout: "force",
    force_config: {
        link_distance: 65,
        link_strength: 0.6,
        charge_strength: -80,
        collide_radius: 35,
        alpha_decay: 0.03
    },
    radial_config: {
        node_spacing: 1.0,
        level_depth: 80
    },
    min_lqi: 0,
    min_lqi_mode: "dim",
    link_style: {
        backbone_width: 3.0,
        backbone_opacity: 1,
        backbone_dash: "",
        route_width: 0.8,
        route_opacity: 0.7,
        route_dash: "",
        neighbor_width: 0.5,
        neighbor_opacity: 0.3,
        neighbor_dash: "3,2",
        dim_width: 0.5,
        dim_opacity: 0.25
    },
    refresh_script: "script.zigbee_map_refresh",
    mock_data: false
};

const MOCK_NODES = [
    { ieeeAddr: "0x00124b0001000000", friendlyName: "Coordinator", type: "Coordinator" },
    { ieeeAddr: "0x00124b0001000001", friendlyName: "Living Room Plug", type: "Router" },
    { ieeeAddr: "0x00124b0001000002", friendlyName: "Kitchen Plug", type: "Router" },
    { ieeeAddr: "0x00124b0001000003", friendlyName: "Hallway Bulb", type: "Router" },
    { ieeeAddr: "0x00124b0001000004", friendlyName: "Bedroom Bulb", type: "Router" },
    { ieeeAddr: "0x00124b0001000005", friendlyName: "Door Sensor", type: "EndDevice" },
    { ieeeAddr: "0x00124b0001000006", friendlyName: "Motion Sensor", type: "EndDevice" },
    { ieeeAddr: "0x00124b0001000007", friendlyName: "Temp Sensor", type: "EndDevice" },
    { ieeeAddr: "0x00124b0001000008", friendlyName: "Window Sensor", type: "EndDevice" },
    { ieeeAddr: "0x00124b0001000009", friendlyName: "Button", type: "EndDevice" },
    { ieeeAddr: "0x00124b000100000a", friendlyName: "Garage Plug", type: "Router" },
    { ieeeAddr: "0x00124b000100000b", friendlyName: "Water Leak", type: "EndDevice" },
    { ieeeAddr: "0x00124b000100000c", friendlyName: "Bathroom Bulb", type: "Router" },
    { ieeeAddr: "0x00124b000100000d", friendlyName: "Desk Lamp", type: "Router" },
    { ieeeAddr: "0x00124b000100000e", friendlyName: "Balcony Plug", type: "Router" },
];
const MOCK_LINKS = [
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b0001000000", lqi: 210, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000000", targetIeeeAddr: "0x00124b0001000001", lqi: 195, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b0001000000", lqi: 180, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000000", targetIeeeAddr: "0x00124b0001000002", lqi: 170, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000001", lqi: 155, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b0001000003", lqi: 140, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000004", targetIeeeAddr: "0x00124b0001000000", lqi: 90, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000000", targetIeeeAddr: "0x00124b0001000004", lqi: 85, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000005", targetIeeeAddr: "0x00124b0001000001", lqi: 120, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b0001000005", lqi: 115, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000006", targetIeeeAddr: "0x00124b0001000002", lqi: 200, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b0001000006", lqi: 190, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000007", targetIeeeAddr: "0x00124b0001000003", lqi: 65, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000007", lqi: 55, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000008", targetIeeeAddr: "0x00124b0001000002", lqi: 175, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b0001000008", lqi: 160, relationship: 0 },
    { sourceIeeeAddr: "0x00124b0001000009", targetIeeeAddr: "0x00124b0001000003", lqi: 45, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000009", lqi: 40, relationship: 0 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b0001000000", lqi: 130, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000000", targetIeeeAddr: "0x00124b000100000a", lqi: 125, relationship: 0 },
    { sourceIeeeAddr: "0x00124b000100000b", targetIeeeAddr: "0x00124b000100000a", lqi: 100, relationship: 1 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b000100000b", lqi: 95, relationship: 0 },
    { sourceIeeeAddr: "0x00124b000100000c", targetIeeeAddr: "0x00124b0001000002", lqi: 165, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b000100000c", lqi: 150, relationship: 0 },
    { sourceIeeeAddr: "0x00124b000100000d", targetIeeeAddr: "0x00124b0001000001", lqi: 110, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b000100000d", lqi: 105, relationship: 0 },
    { sourceIeeeAddr: "0x00124b000100000e", targetIeeeAddr: "0x00124b0001000000", lqi: 75, relationship: 1 },
    { sourceIeeeAddr: "0x00124b0001000000", targetIeeeAddr: "0x00124b000100000e", lqi: 70, relationship: 0 },
    // sibling/neighbor links (relationship: 2) — only visible with link_filter: all
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b0001000002", lqi: 160, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b0001000001", lqi: 155, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000004", lqi: 80, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000004", targetIeeeAddr: "0x00124b0001000003", lqi: 75, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b0001000002", lqi: 110, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b000100000a", lqi: 105, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000c", targetIeeeAddr: "0x00124b000100000d", lqi: 90, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000d", targetIeeeAddr: "0x00124b000100000c", lqi: 85, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b000100000a", lqi: 135, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b0001000001", lqi: 130, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b0001000003", lqi: 145, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000002", lqi: 140, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000e", targetIeeeAddr: "0x00124b0001000003", lqi: 70, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b000100000e", lqi: 65, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b0001000003", lqi: 115, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000003", targetIeeeAddr: "0x00124b0001000001", lqi: 110, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b000100000e", lqi: 55, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000e", targetIeeeAddr: "0x00124b000100000a", lqi: 50, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000002", targetIeeeAddr: "0x00124b000100000e", lqi: 95, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000e", targetIeeeAddr: "0x00124b0001000002", lqi: 90, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000c", targetIeeeAddr: "0x00124b0001000001", lqi: 120, relationship: 2 },
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0x00124b000100000c", lqi: 115, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000d", targetIeeeAddr: "0x00124b000100000a", lqi: 75, relationship: 2 },
    { sourceIeeeAddr: "0x00124b000100000a", targetIeeeAddr: "0x00124b000100000d", lqi: 70, relationship: 2 },
    // phantom links — endpoints that don't exist in MOCK_NODES (broadcast addr, stale device)
    { sourceIeeeAddr: "0x00124b0001000001", targetIeeeAddr: "0xffffffffffffffff", lqi: 0, relationship: 2 },
    { sourceIeeeAddr: "0xdeadbeefdeadbeef", targetIeeeAddr: "0x00124b0001000002", lqi: 80, relationship: 1 },
];

class ZigbeeMeshMapCard extends HTMLElement {

    _opt(key) {
        const val = this._config[key];
        if (val === undefined) return DEFAULTS[key];
        if (typeof DEFAULTS[key] === "object" && !Array.isArray(DEFAULTS[key]) && val && typeof val === "object") {
            return { ...DEFAULTS[key], ...val };
        }
        return val;
    }

    _forceConfigForView(view) {
        const base = this._opt("force_config");
        const viewKey = view === "all" ? "all" : "parent_child";
        const viewOverride = base[viewKey];
        if (viewOverride && typeof viewOverride === "object") {
            const { all, parent_child, ...globals } = base;
            return { ...globals, ...viewOverride };
        }
        const { all, parent_child, ...globals } = base;
        return globals;
    }

    _layoutIcon(layout) {
        return layout === "radial" ? "mdi:sitemap-outline" : "mdi:graph-outline";
    }

    _buildHierarchy(nodes, links) {
        const coord = nodes.find(n => n.type === "Coordinator");
        if (!coord) return null;

        const childrenMap = new Map();
        for (const n of nodes) childrenMap.set(n.id, []);

        const assigned = new Set([coord.id]);
        const parentChildLinks = links.filter(l => l.relationship === 0 || l.relationship === 1);

        for (const l of parentChildLinks) {
            const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
            const tgt = l.targetIeeeAddr || l.target?.ieeeAddr;
            if (src && tgt && !assigned.has(src) && assigned.has(tgt)) {
                childrenMap.get(tgt).push(src);
                assigned.add(src);
            } else if (src && tgt && !assigned.has(tgt) && assigned.has(src)) {
                childrenMap.get(src).push(tgt);
                assigned.add(tgt);
            }
        }

        let changed = true;
        while (changed) {
            changed = false;
            for (const l of parentChildLinks) {
                const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
                const tgt = l.targetIeeeAddr || l.target?.ieeeAddr;
                if (src && tgt && assigned.has(src) && !assigned.has(tgt)) {
                    childrenMap.get(src).push(tgt);
                    assigned.add(tgt);
                    changed = true;
                } else if (src && tgt && assigned.has(tgt) && !assigned.has(src)) {
                    childrenMap.get(tgt).push(src);
                    assigned.add(src);
                    changed = true;
                }
            }
        }

        for (const n of nodes) {
            if (!assigned.has(n.id)) {
                childrenMap.get(coord.id).push(n.id);
                assigned.add(n.id);
            }
        }

        const nodeById = new Map(nodes.map(n => [n.id, n]));
        const buildTree = (id) => {
            const node = nodeById.get(id);
            const kids = childrenMap.get(id) || [];
            return {
                id,
                friendlyName: node?.friendlyName || id,
                type: node?.type || "Unknown",
                backbone: node?.backbone || false,
                children: kids.map(buildTree)
            };
        };

        return d3.hierarchy(buildTree(coord.id));
    }

    _lqiColor(lqi) {
        const thresholds = this._opt("lqi_colors");
        const sorted = Object.keys(thresholds).map(Number).sort((a, b) => b - a);
        for (const t of sorted) {
            if (lqi >= t) return thresholds[t];
        }
        return thresholds[sorted[sorted.length - 1]] || "#5F5F5F";
    }

    static getStubConfig() {
        return { entity: "sensor.zigbee2mqtt_networkmap" };
    }

    getCardSize() {
        return 5;
    }

    getLayoutOptions() {
        const layout = this._config?.layout_options || {};
        return {
            grid_columns: layout.grid_columns ?? 4,
            grid_rows: layout.grid_rows ?? 8,
        };
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("zigbee-mesh-map requires 'entity:'");
        }
        this._config = config;

        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                }
                ha-card {
                    padding: 8px;
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
                .card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding-bottom: 12px;
                }
                .footer {
                    font-size: 12px;
                    opacity: 0.6;
                    padding-top: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 4px;
                    cursor: pointer;
                }
                .footer:hover {
                    opacity: 0.9;
                }
                .header-actions {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .action-icon {
                    cursor: pointer;
                    color: var(--primary-text-color);
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transform-origin: center;
                }
                .action-icon:hover {
                    opacity: 0.7;
                }
                .refresh-icon {
                    color: var(--primary-text-color);
                    width: 16px;
                    height: 16px;
                    --mdc-icon-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transform-origin: center;
                }
                :host(.fullscreen) {
                    position: fixed !important;
                    top: 0;
                    left: 0;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999;
                    background: var(--card-background-color, #fff);
                }
                :host(.fullscreen) ha-card {
                    border-radius: 0;
                    height: 100%;
                }
                .refresh-icon.spin {
                    animation: spin 0.8s linear;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                .map-refreshing {
                    animation: pulse 1.2s ease-in-out infinite;
                    opacity: 0.6;
                }
                @keyframes pulse {
                    0%   { transform: scale(1); opacity: 0.6; }
                    50%  { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.6; }
                }
                #wrapper {
                    width: 100%;
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                #z2m-svg-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border-radius: 12px;
                }
                .warning-banner {
                    background: rgba(244, 67, 54, 0.15);
                    border: 1px solid #F44336;
                    border-radius: 8px;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: var(--primary-text-color);
                    display: none;
                }
            </style>

            <ha-card>
                <div class="card-header">
                    ${this._config.title || "Zigbee Mesh Map"}
                    <span class="header-actions">
                        <ha-icon id="layout-btn" icon="${this._layoutIcon(this._config.layout || DEFAULTS.layout)}" class="action-icon" title="Toggle layout" style="${(this._config.link_filter || DEFAULTS.link_filter) === 'all' ? 'display:none' : ''}"></ha-icon>
                        <ha-icon id="link-filter-btn" icon="${(this._config.link_filter || DEFAULTS.link_filter) === 'all' ? 'mdi:web' : 'mdi:family-tree'}" class="action-icon" title="Toggle link filter"></ha-icon>
                        <ha-icon id="reset-zoom-btn" icon="mdi:fit-to-screen-outline" class="action-icon" title="Reset zoom"></ha-icon>
                        <ha-icon id="fullscreen-btn" icon="mdi:fullscreen" class="action-icon"></ha-icon>
                    </span>
                </div>

                <div class="warning-banner" id="warning-banner"></div>

                <div id="wrapper">
                    <svg id="z2m-svg-canvas"></svg>
                </div>

                <div class="footer" id="footer">
                    <span id="timestamp"></span>
                    <ha-icon id="refresh-btn" icon="mdi:refresh" class="refresh-icon"></ha-icon>
                </div>
            </ha-card>
        `;

        const refreshScript = this._opt("refresh_script");
        const useMock = this._opt("mock_data");
        const footer = this.shadowRoot.getElementById("footer");
        if (useMock) {
            footer.style.cursor = "default";
            this.shadowRoot.getElementById("refresh-btn").style.display = "none";
        } else {
            footer.addEventListener("click", () => {
                const icon = this.shadowRoot.getElementById("refresh-btn");
                icon.classList.add("spin");
                setTimeout(() => icon.classList.remove("spin"), 1000);
                this.shadowRoot.getElementById("wrapper").classList.add("map-refreshing");
                this._updating = true;
                this._hass.callService("script", "turn_on", {
                    entity_id: refreshScript
                });
            });
        }

        this._toggleFullscreen = () => {
            const isFullscreen = this.classList.toggle("fullscreen");
            this.shadowRoot.getElementById("fullscreen-btn").icon = isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen";
        };

        this.shadowRoot.getElementById("fullscreen-btn").addEventListener("click", () => this._toggleFullscreen());

        this.shadowRoot.getElementById("reset-zoom-btn").addEventListener("click", () => {
            if (this._fitToContent) this._fitToContent();
        });

        this._onKeyDown = (e) => {
            if (e.key === "f" || e.key === "F") {
                if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
                this._toggleFullscreen();
            }
        };
        document.addEventListener("keydown", this._onKeyDown);

        this._linkFilter = this._opt("link_filter");
        this._layout = this._opt("layout");

        const layoutBtn = this.shadowRoot.getElementById("layout-btn");
        const updateLayoutBtnVisibility = () => {
            layoutBtn.style.display = this._linkFilter === "all" ? "none" : "";
        };
        updateLayoutBtnVisibility();

        this._savedLayout = null;
        this.shadowRoot.getElementById("link-filter-btn").addEventListener("click", () => {
            this._linkFilter = this._linkFilter === "all" ? "parent-child" : "all";
            const btn = this.shadowRoot.getElementById("link-filter-btn");
            btn.icon = this._linkFilter === "all" ? "mdi:web" : "mdi:family-tree";
            if (this._linkFilter === "all") {
                this._savedLayout = this._layout;
                this._layout = "force";
                layoutBtn.icon = this._layoutIcon("force");
            } else if (this._savedLayout) {
                this._layout = this._savedLayout;
                layoutBtn.icon = this._layoutIcon(this._layout);
                this._savedLayout = null;
            }
            updateLayoutBtnVisibility();
            if (this._lastRawNodes && this._lastRawLinks) {
                this.renderZigbeeMap(this._lastRawNodes, this._lastRawLinks);
            }
        });

        layoutBtn.addEventListener("click", () => {
            this._layout = this._layout === "force" ? "radial" : "force";
            layoutBtn.icon = this._layoutIcon(this._layout);
            if (this._lastRawNodes && this._lastRawLinks) {
                this.renderZigbeeMap(this._lastRawNodes, this._lastRawLinks);
            }
        });

        this._lastNodesJson = null;
        this._lastLinksJson = null;
        this._lastUpdated = null;
        this._simulation = null;
        this._autoRefreshAttempted = false;
        this._lastRawNodes = null;
        this._lastRawLinks = null;
    }

    disconnectedCallback() {
        if (this._simulation) {
            this._simulation.stop();
            this._simulation = null;
        }
        if (this._onKeyDown) {
            document.removeEventListener("keydown", this._onKeyDown);
        }
    }

    set hass(hass) {
        this._hass = hass;

        const entity = hass.states[this._config.entity];
        const banner = this.shadowRoot.getElementById("warning-banner");

        const useMock = this._opt("mock_data");
        const hasValidData = entity && Array.isArray(entity.attributes?.nodes) && Array.isArray(entity.attributes?.links);
        const refreshScript = this._opt("refresh_script");
        const hasRefreshScript = !!hass.states[refreshScript];

        if (useMock) {
            banner.style.display = "none";
        } else if (!hasValidData && !this._autoRefreshAttempted && entity && hasRefreshScript) {
            this._autoRefreshAttempted = true;
            this._updating = true;
            banner.textContent = "Requesting network map data…";
            banner.style.display = "block";
            banner.style.background = "rgba(33, 150, 243, 0.15)";
            banner.style.borderColor = "#2196F3";
            this.shadowRoot.getElementById("wrapper").classList.add("map-refreshing");
            this._hass.callService("script", "turn_on", { entity_id: refreshScript });
            return;
        } else if (!hasValidData && this._updating) {
            return;
        } else if (!hasValidData) {
            const warnings = [];
            if (!entity) {
                warnings.push(`Entity "${this._config.entity}" not found. Check your entity configuration.`);
            } else {
                warnings.push(`Entity "${this._config.entity}" does not contain expected network map data (nodes/links). Ensure your MQTT sensor is configured correctly.`);
            }
            if (!hasRefreshScript) {
                warnings.push(`Refresh script "${refreshScript}" not found. Create it or set refresh_script in card config.`);
            }
            banner.innerHTML = warnings.map(w => `⚠ ${w}`).join("<br>");
            banner.style.display = "block";
            banner.style.background = "rgba(244, 67, 54, 0.15)";
            banner.style.borderColor = "#F44336";
            return;
        } else {
            banner.style.display = "none";
        }

        const ts = this.shadowRoot.getElementById("timestamp");

        if (useMock) {
            ts.textContent = "Mock data";
        } else if (this._lastUpdated !== entity.last_updated) {
            this._updating = false;
            this._lastUpdated = entity.last_updated;
            this.shadowRoot.getElementById("wrapper").classList.remove("map-refreshing");
        }

        if (!useMock) {
            if (this._updating) {
                ts.textContent = "Refreshing data…";
            } else {
                ts.textContent = new Date(entity.last_updated).toLocaleString(navigator.language);
            }
        }

        const nodes = useMock ? MOCK_NODES : (entity.attributes.nodes || []);
        const links = useMock ? MOCK_LINKS : (entity.attributes.links || []);
        const nodesJson = JSON.stringify(nodes);
        const linksJson = JSON.stringify(links);

        if (nodesJson !== this._lastNodesJson || linksJson !== this._lastLinksJson) {
            this._lastNodesJson = nodesJson;
            this._lastLinksJson = linksJson;
            this._lastRawNodes = nodes;
            this._lastRawLinks = links;
            this.renderZigbeeMap(nodes, links);
        }
    }

    renderZigbeeMap(rawNodes, rawLinks) {
        if (this._simulation) {
            this._simulation.stop();
            this._simulation = null;
        }

        const coordColor = this._opt("coordinator_color");
        const routerColor = this._opt("router_color");
        const routerLeafColor = this._opt("router_leaf_color");
        const endDeviceColor = this._opt("end_device_color");
        const fontSize = this._opt("font_size");
        const nodeRadiusCfg = this._opt("node_radius");
        const linkFilter = this._linkFilter || this._opt("link_filter");
        const forceCfg = this._forceConfigForView(linkFilter);
        const showLqiLabels = this._opt("show_lqi_labels");
        const showNodeLabels = this._opt("show_node_labels");

        const nodes = rawNodes.map(n => ({
            id: n.ieeeAddr,
            friendlyName: n.friendlyName,
            type: n.type
        }));

        // Filter out phantom links (broadcast addr, stale devices) that would crash d3-force
        const validIds = new Set(nodes.map(n => n.id));
        const droppedLinks = [];
        const safeRawLinks = rawLinks.filter(l => {
            const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
            const tgt = l.targetIeeeAddr || l.target?.ieeeAddr;
            const ok = src && tgt && validIds.has(src) && validIds.has(tgt);
            if (!ok) droppedLinks.push({ src, tgt, rel: l.relationship });
            return ok;
        });
        if (droppedLinks.length) {
            console.warn(
                `[zigbee-mesh-map] dropped ${droppedLinks.length} link(s) with missing endpoints`,
                droppedLinks
            );
        }

        const lqiLookup = new Map();
        for (const l of safeRawLinks) {
            const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
            const tgt = l.targetIeeeAddr || l.target?.ieeeAddr;
            if (src && tgt) lqiLookup.set(`${src}->${tgt}`, l.lqi);
        }

        const parentIds = new Set();
        for (const l of safeRawLinks) {
            if (l.relationship === 0) {
                const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
                if (src) parentIds.add(src);
            }
        }

        const nodeById = new Map(nodes.map(n => [n.id, n]));
        for (const n of nodes) {
            if (n.type === "Router") {
                n.backbone = parentIds.has(n.id);
            }
        }

        const isBackboneNode = (id) => {
            const n = nodeById.get(id);
            return n && (n.type === "Coordinator" || (n.type === "Router" && n.backbone));
        };

        const filteredLinks = linkFilter === "all"
            ? safeRawLinks
            : safeRawLinks.filter(l => l.relationship === 0 || l.relationship === 1);

        const linkMap = new Map();
        for (const l of filteredLinks) {
            const src = l.sourceIeeeAddr || l.source?.ieeeAddr;
            const tgt = l.targetIeeeAddr || l.target?.ieeeAddr;
            const key = [src, tgt].sort().join("-");
            const isParentChild = l.relationship === 0 || l.relationship === 1;
            if (!linkMap.has(key)) {
                const fwdLqi = lqiLookup.get(`${src}->${tgt}`);
                const revLqi = lqiLookup.get(`${tgt}->${src}`);
                let tier = "neighbor";
                if (isParentChild) tier = isBackboneNode(src) && isBackboneNode(tgt) ? "backbone" : "route";
                linkMap.set(key, { source: src, target: tgt, lqi: fwdLqi ?? null, lqiReverse: revLqi ?? null, tier });
            } else if (isParentChild) {
                const entry = linkMap.get(key);
                if (entry.tier === "neighbor") entry.tier = isBackboneNode(src) && isBackboneNode(tgt) ? "backbone" : "route";
                else if (entry.tier === "route" && isBackboneNode(src) && isBackboneNode(tgt)) entry.tier = "backbone";
            }
        }
        const minLqi = this._opt("min_lqi");
        const minLqiMode = this._opt("min_lqi_mode");
        const allLinks = Array.from(linkMap.values());
        const links = minLqiMode === "remove"
            ? allLinks.filter(d => {
                const lqi = d.lqiReverse != null ? (d.lqi + d.lqiReverse) / 2 : d.lqi;
                return lqi == null || lqi >= minLqi;
            })
            : allLinks;

        const width = 400;
        const height = 400;
        const textColor = "var(--primary-text-color, #fff)";

        const svg = d3.select(this.shadowRoot.querySelector("#z2m-svg-canvas"))
            .attr("viewBox", [0, 0, width, height]);

        svg.selectAll("*").remove();

        const container = svg.append("g");

        const zoomCfg = this._opt("zoom");
        const zoom = d3.zoom()
            .scaleExtent([zoomCfg.min, zoomCfg.max])
            .on("zoom", (event) => container.attr("transform", event.transform));

        svg.call(zoom);
        if (zoomCfg.initial !== "auto") {
            const s = zoomCfg.initial;
            svg.call(zoom.transform, d3.zoomIdentity.translate(width * (1 - s) / 2, height * (1 - s) / 2).scale(s));
        }

        const resetZoom = () => {
            const s = zoomCfg.initial;
            svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(width * (1 - s) / 2, height * (1 - s) / 2).scale(s));
        };
        this._fitToContent = null;
        const fitToContent = (pointsArray) => {
            const pad = 15;
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            for (const n of pointsArray) {
                if (n.x < x0) x0 = n.x;
                if (n.y < y0) y0 = n.y;
                if (n.x > x1) x1 = n.x;
                if (n.y > y1) y1 = n.y;
            }
            const bw = (x1 - x0) || 1;
            const bh = (y1 - y0) || 1;
            const s = Math.min(width / (bw + pad * 2), height / (bh + pad * 2));
            const tx = width / 2 - s * (x0 + bw / 2);
            const ty = height / 2 - s * (y0 + bh / 2);
            svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(s));
        };

        const avgLqi = (d) => d.lqiReverse != null ? (d.lqi + d.lqiReverse) / 2 : d.lqi;

        const isWeak = (d) => {
            const lqi = avgLqi(d);
            return lqi != null && lqi < minLqi;
        };

        const linkStyle = this._opt("link_style");
        const tierProp = (d, prop) => linkStyle[`${d.tier}_${prop}`];

        const nodeRadius = (d) => {
            if (d.type === "Coordinator") return nodeRadiusCfg.coordinator;
            if (d.type === "EndDevice") return nodeRadiusCfg.end_device;
            if (d.type === "Router" && !d.backbone) return nodeRadiusCfg.router_leaf;
            return nodeRadiusCfg.router;
        };

        const nodeFill = (d) => {
            if (d.type === "Coordinator") return coordColor;
            if (d.type === "EndDevice") return endDeviceColor;
            if (d.type === "Router" && !d.backbone) return routerLeafColor;
            return routerColor;
        };

        const outlineColor = this._opt("node_outline_color");

        const connectedIds = (nodeId) => {
            const ids = new Set([nodeId]);
            for (const l of links) {
                const sid = typeof l.source === "object" ? l.source.id : l.source;
                const tid = typeof l.target === "object" ? l.target.id : l.target;
                if (sid === nodeId) ids.add(tid);
                if (tid === nodeId) ids.add(sid);
            }
            return ids;
        };

        const dimOpacity = 0.08;

        const isConnectedLink = (d, nodeId) => {
            const sid = typeof d.source === "object" ? d.source.id : d.source;
            const tid = typeof d.target === "object" ? d.target.id : d.target;
            return sid === nodeId || tid === nodeId;
        };

        const labelOffset = (d) => {
            if (d.type === "Coordinator") return -(nodeRadiusCfg.coordinator + 4);
            if (d.type === "EndDevice") return -(nodeRadiusCfg.end_device + 5);
            if (d.type === "Router" && !d.backbone) return -(nodeRadiusCfg.router_leaf + 4);
            return -(nodeRadiusCfg.router + 4);
        };

        const layout = this._layout || this._opt("layout");

        if (layout === "radial") {
            const root = this._buildHierarchy(nodes, safeRawLinks);
            if (!root) return;

            const radialCfg = this._opt("radial_config");
            const treeLayout = d3.tree()
                .nodeSize([radialCfg.node_spacing, radialCfg.level_depth])
                .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth || 1);
            treeLayout(root);

            const toCartesian = (d) => {
                const angle = d.x - Math.PI / 2;
                const r = d.y;
                return { x: width / 2 + r * Math.cos(angle), y: height / 2 + r * Math.sin(angle) };
            };

            const descendants = root.descendants();
            const treeLinks = root.links();

            descendants.forEach(d => {
                const pos = toCartesian(d);
                d.cx = pos.x;
                d.cy = pos.y;
            });

            const hierLinkLookup = new Map();
            for (const l of links) {
                const key = [l.source, l.target].sort().join("-");
                hierLinkLookup.set(key, l);
            }

            const link = container.append("g").selectAll("path")
                .data(treeLinks).join("path")
                .attr("fill", "none")
                .attr("d", d => {
                    const s = toCartesian(d.source);
                    const t = toCartesian(d.target);
                    return `M${s.x},${s.y} C${(s.x + t.x) / 2},${s.y} ${(s.x + t.x) / 2},${t.y} ${t.x},${t.y}`;
                })
                .each((d) => {
                    const key = [d.source.data.id, d.target.data.id].sort().join("-");
                    d._linkData = hierLinkLookup.get(key) || null;
                })
                .attr("stroke", d => d._linkData ? this._lqiColor(avgLqi(d._linkData)) : "var(--primary-text-color, #aaa)")
                .attr("stroke-width", d => {
                    if (!d._linkData) return linkStyle.route_width;
                    return (minLqiMode === "dim" && isWeak(d._linkData)) ? linkStyle.dim_width : tierProp(d._linkData, "width");
                })
                .attr("stroke-opacity", d => {
                    if (!d._linkData) return linkStyle.route_opacity;
                    return (minLqiMode === "dim" && isWeak(d._linkData)) ? linkStyle.dim_opacity : tierProp(d._linkData, "opacity");
                })
                .attr("stroke-dasharray", d => d._linkData ? (tierProp(d._linkData, "dash") || null) : null);

            const node = container.append("g").selectAll("circle")
                .data(descendants).join("circle")
                .attr("cx", d => d.cx)
                .attr("cy", d => d.cy)
                .attr("r", d => nodeRadius(d.data))
                .attr("fill", d => nodeFill(d.data))
                .attr("stroke", outlineColor)
                .attr("stroke-width", 1)
                .style("cursor", "pointer")
                .on("click", (event, d) => {
                    event.stopPropagation();
                    if (this._highlighted === d.data.id) {
                        this._highlighted = null;
                        resetHighlight();
                    } else {
                        this._highlighted = d.data.id;
                        applyHighlight(d.data.id);
                    }
                });

            const applyHighlight = (nodeId) => {
                const connected = connectedIds(nodeId);
                node.transition().duration(200)
                    .attr("opacity", d => connected.has(d.data.id) ? 1 : dimOpacity);
                link.transition().duration(200)
                    .attr("opacity", d => {
                        return d.source.data.id === nodeId || d.target.data.id === nodeId ? 1 : dimOpacity;
                    })
                    .attr("stroke-opacity", d => {
                        return d.source.data.id === nodeId || d.target.data.id === nodeId ? 1 : dimOpacity;
                    });
                if (text) text.transition().duration(200)
                    .attr("opacity", d => connected.has(d.data.id) ? 1 : dimOpacity);
                if (linkLabels) linkLabels.transition().duration(200)
                    .attr("opacity", d => {
                        return d.source.data.id === nodeId || d.target.data.id === nodeId ? 1 : dimOpacity;
                    })
                    .attr("fill-opacity", d => {
                        return d.source.data.id === nodeId || d.target.data.id === nodeId ? 1 : dimOpacity;
                    });
            };

            const resetHighlight = () => {
                node.transition().duration(200).attr("opacity", 1);
                link.transition().duration(200)
                    .attr("opacity", 1)
                    .attr("stroke-opacity", d => {
                        if (!d._linkData) return linkStyle.route_opacity;
                        return (minLqiMode === "dim" && isWeak(d._linkData)) ? linkStyle.dim_opacity : tierProp(d._linkData, "opacity");
                    });
                if (text) text.transition().duration(200).attr("opacity", 1);
                if (linkLabels) linkLabels.transition().duration(200)
                    .attr("opacity", 1)
                    .attr("fill-opacity", d => {
                        if (!d._linkData) return linkStyle.route_opacity;
                        return (minLqiMode === "dim" && isWeak(d._linkData)) ? linkStyle.dim_opacity : tierProp(d._linkData, "opacity");
                    });
            };

            svg.on("click", () => {
                this._highlighted = null;
                resetHighlight();
            });

            let linkLabels;
            if (showLqiLabels) {
                linkLabels = container.append("g").selectAll("text")
                    .data(treeLinks).join("text")
                    .text(d => {
                        if (!d._linkData) return "";
                        if (d._linkData.lqiReverse == null) return d._linkData.lqi;
                        const lqiFormat = this._opt("lqi_format");
                        if (lqiFormat === "avg") return Math.round((d._linkData.lqi + d._linkData.lqiReverse) / 2);
                        return `${d._linkData.lqi}/${d._linkData.lqiReverse}`;
                    })
                    .attr("x", d => (toCartesian(d.source).x + toCartesian(d.target).x) / 2)
                    .attr("y", d => (toCartesian(d.source).y + toCartesian(d.target).y) / 2)
                    .attr("fill", d => d._linkData ? this._lqiColor(avgLqi(d._linkData)) : "var(--primary-text-color, #aaa)")
                    .attr("fill-opacity", d => {
                        if (!d._linkData) return linkStyle.route_opacity;
                        return (minLqiMode === "dim" && isWeak(d._linkData)) ? linkStyle.dim_opacity : tierProp(d._linkData, "opacity");
                    })
                    .attr("font-size", `${fontSize}px`)
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .style("paint-order", "stroke")
                    .attr("stroke", "var(--card-background-color, #fff)")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", 3)
                    .attr("stroke-linejoin", "round")
                    .style("pointer-events", "none");
            }

            let text;
            if (showNodeLabels) {
                text = container.append("g").selectAll("text")
                    .data(descendants).join("text")
                    .text(d => d.data.friendlyName)
                    .attr("x", d => d.cx)
                    .attr("y", d => d.cy)
                    .attr("fill", textColor)
                    .attr("font-size", `${fontSize}px`)
                    .attr("text-anchor", "middle")
                    .attr("dy", d => labelOffset(d.data))
                    .style("paint-order", "stroke")
                    .attr("stroke", "var(--card-background-color, #fff)")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", 3)
                    .attr("stroke-linejoin", "round")
                    .style("pointer-events", "none");
            }

            if (zoomCfg.initial === "auto") {
                const radialPoints = descendants.map(d => ({ x: d.cx, y: d.cy }));
                this._fitToContent = () => fitToContent(radialPoints);
                this._fitToContent();
            } else {
                this._fitToContent = resetZoom;
            }

        } else {

            const radius = Math.min(width, height) * 0.15;
            const centerX = width / 2;
            const centerY = height / 2;

            nodes.forEach((n, i) => {
                const angle = (i / nodes.length) * 2 * Math.PI;
                n.x = centerX + radius * Math.cos(angle);
                n.y = centerY + radius * Math.sin(angle);
            });

            const sim = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(forceCfg.link_distance).strength(forceCfg.link_strength))
                .force("charge", d3.forceManyBody().strength(forceCfg.charge_strength))
                .force("collide", d3.forceCollide().radius(forceCfg.collide_radius))
                .force("x", d3.forceX(width / 2).strength(0.03))
                .force("y", d3.forceY(height / 2).strength(0.03))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .alpha(1)
                .alphaDecay(forceCfg.alpha_decay);

            this._simulation = sim;

            const link = container.append("g").selectAll("line")
                .data(links).join("line")
                .attr("stroke", d => this._lqiColor(avgLqi(d)))
                .attr("stroke-width", d => (minLqiMode === "dim" && isWeak(d)) ? linkStyle.dim_width : tierProp(d, "width"))
                .attr("stroke-opacity", d => (minLqiMode === "dim" && isWeak(d)) ? linkStyle.dim_opacity : tierProp(d, "opacity"))
                .attr("stroke-dasharray", d => tierProp(d, "dash") || null);

            const node = container.append("g").selectAll("circle")
                .data(nodes).join("circle")
                .attr("r", nodeRadius)
                .attr("fill", nodeFill)
                .attr("stroke", outlineColor)
                .attr("stroke-width", 1)
                .style("cursor", "pointer")
                .call(d3.drag()
                    .on("start", e => {
                        if (!e.active) sim.alphaTarget(0.3).restart();
                        e.subject.fx = e.subject.x;
                        e.subject.fy = e.subject.y;
                        e.subject._dragged = false;
                    })
                    .on("drag", e => {
                        e.subject.fx = e.x;
                        e.subject.fy = e.y;
                        e.subject._dragged = true;
                    })
                    .on("end", e => {
                        if (!e.active) sim.alphaTarget(0);
                        e.subject.fx = null;
                        e.subject.fy = null;
                    })
                )
                .on("click", (event, d) => {
                    if (d._dragged) return;
                    event.stopPropagation();
                    if (this._highlighted === d.id) {
                        this._highlighted = null;
                        resetHighlight();
                    } else {
                        this._highlighted = d.id;
                        applyHighlight(d.id);
                    }
                });

            const applyHighlight = (nodeId) => {
                const connected = connectedIds(nodeId);
                node.transition().duration(200)
                    .attr("opacity", d => connected.has(d.id) ? 1 : dimOpacity);
                link.transition().duration(200)
                    .attr("opacity", d => isConnectedLink(d, nodeId) ? 1 : dimOpacity)
                    .attr("stroke-opacity", d => isConnectedLink(d, nodeId) ? 1 : dimOpacity);
                if (text) text.transition().duration(200)
                    .attr("opacity", d => connected.has(d.id) ? 1 : dimOpacity);
                if (linkLabels) linkLabels.transition().duration(200)
                    .attr("opacity", d => isConnectedLink(d, nodeId) ? 1 : dimOpacity)
                    .attr("fill-opacity", d => isConnectedLink(d, nodeId) ? 1 : dimOpacity);
            };

            const resetHighlight = () => {
                node.transition().duration(200).attr("opacity", 1);
                link.transition().duration(200)
                    .attr("opacity", 1)
                    .attr("stroke-opacity", d =>
                        (minLqiMode === "dim" && isWeak(d)) ? linkStyle.dim_opacity : tierProp(d, "opacity"));
                if (text) text.transition().duration(200).attr("opacity", 1);
                if (linkLabels) linkLabels.transition().duration(200)
                    .attr("opacity", 1)
                    .attr("fill-opacity", d =>
                        (minLqiMode === "dim" && isWeak(d)) ? linkStyle.dim_opacity : tierProp(d, "opacity"));
            };

            svg.on("click", () => {
                this._highlighted = null;
                resetHighlight();
            });

            let linkLabels;
            if (showLqiLabels) {
                linkLabels = container.append("g").selectAll("text")
                    .data(links).join("text")
                    .text(d => {
                        if (d.lqiReverse == null) return d.lqi;
                        const lqiFormat = this._opt("lqi_format");
                        if (lqiFormat === "avg") return Math.round((d.lqi + d.lqiReverse) / 2);
                        return `${d.lqi}/${d.lqiReverse}`;
                    })
                    .attr("fill", d => this._lqiColor(avgLqi(d)))
                    .attr("fill-opacity", d => (minLqiMode === "dim" && isWeak(d)) ? linkStyle.dim_opacity : tierProp(d, "opacity"))
                    .attr("font-size", `${fontSize}px`)
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .style("paint-order", "stroke")
                    .attr("stroke", "var(--card-background-color, #fff)")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", 3)
                    .attr("stroke-linejoin", "round")
                    .style("pointer-events", "none");
            }

            let text;
            if (showNodeLabels) {
                text = container.append("g").selectAll("text")
                    .data(nodes).join("text")
                    .text(d => d.friendlyName)
                    .attr("fill", textColor)
                    .attr("font-size", `${fontSize}px`)
                    .attr("text-anchor", "middle")
                    .attr("dy", labelOffset)
                    .style("paint-order", "stroke")
                    .attr("stroke", "var(--card-background-color, #fff)")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", 3)
                    .attr("stroke-linejoin", "round")
                    .style("pointer-events", "none");
            }

            if (zoomCfg.initial === "auto") {
                this._fitToContent = () => fitToContent(nodes);
                let initialFitDone = false;
                sim.on("end", () => {
                    if (!initialFitDone) {
                        initialFitDone = true;
                        this._fitToContent();
                    }
                });
            } else {
                this._fitToContent = resetZoom;
            }

            sim.on("tick", () => {
                link
                    .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
                node
                    .attr("cx", d => d.x).attr("cy", d => d.y);
                if (text) {
                    text.attr("x", d => d.x).attr("y", d => d.y);
                }
                if (linkLabels) {
                    linkLabels
                        .attr("x", d => (d.source.x + d.target.x) / 2)
                        .attr("y", d => (d.source.y + d.target.y) / 2);
                }
            });
        }
    }
}

customElements.define("zigbee-mesh-map", ZigbeeMeshMapCard);

console.info(
    `%c ZIGBEE-MESH-MAP %c v${CARD_VERSION} `,
    "color: #000; background: #41BDF5; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
    "color: #fff; background: #696969; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);
