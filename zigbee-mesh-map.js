import * as d3 from "https://cdn.skypack.dev/d3@7";

class ZigbeeMeshMapCard extends HTMLElement {

    setConfig(config) {
        if (!config.entity) {
            throw new Error("zigbee-mesh-map requires 'entity:'");
        }
        this._config = config;
    
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                ha-card {
                    padding: 8px;
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
                    padding-top: 8px;
                    text-align: right;
                }
                .refresh-icon {
                    cursor: pointer;
                    color: var(--primary-text-color);
                    width: 24px;
                    height: 24px;
                
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                
                    transform-origin: center;
                }
                .refresh-icon:hover {
                    opacity: 0.7;
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
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.6; }
                }
                #wrapper {
                    width: 100%;
                    height: 400px;
                    position: relative;
                }
                #z2m-svg-canvas {
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border-radius: 12px;
                }
            </style>
        
            <ha-card>
                <div class="card-header">
                    ${this._config.title || "Zigbee Mesh Map"}
                    <ha-icon id="refresh-btn" icon="mdi:refresh" class="refresh-icon"></ha-icon>
                </div>
            
                <div id="wrapper">
                    <svg id="z2m-svg-canvas"></svg>
                </div>
            
                <div class="footer" id="timestamp"></div>
            </ha-card>
        `;

        this.shadowRoot.addEventListener("click", (ev) => {
            if (ev.target.id === "refresh-btn") {
                ev.target.classList.add("spin");
                setTimeout(() => ev.target.classList.remove("spin"), 1000);
                const wrapper = this.shadowRoot.getElementById("wrapper");
                wrapper.classList.add("map-refreshing");
                this._updating = true;
                this._hass.callService("script", "turn_on", {
                    entity_id: "script.zigbee_map_refresh"
                });
            }
        });
    }

    set hass(hass) {
        this._hass = hass;
        
        const entity = hass.states[this._config.entity];
        if (!entity) return;
    
        const nodes = entity.attributes.nodes || [];
        const links = entity.attributes.links || [];
    
        // Update footer timestamp
        const ts = this.shadowRoot.getElementById("timestamp");

        if (this._lastUpdated !== entity.last_updated) {
            this._updating = false;
            this._lastUpdated = entity.last_updated;
            const wrapper = this.shadowRoot.getElementById("wrapper");
            wrapper.classList.remove("map-refreshing");
        }

        if (this._updating) {
            ts.textContent = "Refreshing data …";
        } else {
            const date = new Date(entity.last_updated);
            const formatted = date.toLocaleString("en", { hour12: false });
            ts.textContent = formatted;
        }
    
        if (JSON.stringify(nodes) !== this._lastNodesJson || JSON.stringify(links) !== this._lastLinksJson) {
            this._lastNodesJson = JSON.stringify(nodes);
            this._lastLinksJson = JSON.stringify(links);
            this.renderZigbeeMap(nodes, links);
        }
    }

    async renderZigbeeMap(nodes, links) {
        function lqiColor(lqi) {
            // Green
            if (lqi >= 200)
                return "#4CAF50";
            // Yellow
            if (lqi >= 150)
                return "#FDD835";
            // Orange
            if (lqi >= 100)
                return "#FB8C00";
            // Red
            if (lqi >= 50)
                return "#F44336";
            // Grey
            return "#5F5F5F";
        }

        // Filter only parent-child relationships
        links = links.filter(l => l.relationship === 0 || l.relationship === 1);

        // Normalize nodes
        nodes = nodes.map(n => ({
            id: n.ieeeAddr,
            friendlyName: n.friendlyName,
            type: n.type
        }));

        // Normalize links
        links = links.map(l => ({
            source: l.sourceIeeeAddr || l.source?.ieeeAddr,
            target: l.targetIeeeAddr || l.target?.ieeeAddr,
            lqi: l.lqi
        }));

        const width = 400;
        const height = 400;

        const svg = d3.select(this.shadowRoot.querySelector("#z2m-svg-canvas")).attr("viewBox", [0, 0, width, height]);

        svg.selectAll("*").remove();

        // Create container group for zoom/pan
        const container = svg.append("g");

        // Enable zoom + pan
        const zoom = d3.zoom().scaleExtent([0.2, 4]).on("zoom", (event) => {
            container.attr("transform", event.transform);
        }
        );

        svg.call(zoom);

        svg.call(zoom.transform, d3.zoomIdentity.translate(width * -0.25, height * -0.25).scale(1.5));

        svg.append("defs").append("marker").attr("id", "arrow").attr("viewBox", "0 -5 10 10").attr("refX", 25).attr("orient", "auto").attr("markerWidth", 6).attr("markerHeight", 6).append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#ff0000");

        // Determine which nodes are parents
        const parentIds = new Set(links.map(l => l.source));

        // Pre-position nodes in a circle to reduce initial entanglement
        const radius = Math.min(width, height) * 0.15;
        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach( (n, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            n.x = centerX + radius * Math.cos(angle);
            n.y = centerY + radius * Math.sin(angle);
        }
        );

        const sim = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id).distance(30).strength(0.8)).force("charge", d3.forceManyBody().strength(-20)).force("collide", d3.forceCollide().radius(25)).force("x", d3.forceX(width / 2).strength(0.03)).force("y", d3.forceY(height / 2).strength(0.03)).force("center", d3.forceCenter(width / 2, height / 2)).alpha(1).alphaDecay(0.04);
        const link = container.append("g").selectAll("line").data(links).join("line").attr("stroke", d => lqiColor(d.lqi)).attr("stroke-width", 1.5);
        const linkLabels = container.append("g").selectAll("text").data(links).join("text").text(d => d.lqi).attr("fill", d => lqiColor(d.lqi)).attr("font-size", "6px").attr("font-weight", "bold");
        const node = container.append("g").selectAll("circle").data(nodes).join("circle").attr("r", d => {
            if (d.type === "Coordinator")
                return 10;
            if (parentIds.has(d.id))
                return 10;
            // parent/router
            return 5;
            // end device (50% smaller)
        }
        ).attr("fill", d => d.type === "Coordinator" ? "#DB5228" : "#0000ff").attr("stroke", "#fff").attr("stroke-width", 1).call(d3.drag().on("start", e => {
            if (!e.active)
                sim.alphaTarget(0.3).restart();
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
        }
        ).on("drag", e => {
            e.subject.fx = e.x;
            e.subject.fy = e.y;
        }
        ).on("end", e => {
            if (!e.active)
                sim.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
        }
        ));

        const text = container.append("g").selectAll("text").data(nodes).join("text").text(d => d.friendlyName).attr("fill", "#fff").attr("font-size", "6px").attr("text-anchor", "middle").attr("dy", d => {
            if (d.type === "Coordinator")
                return -14;
            // above big node
            if (parentIds.has(d.id))
                return -14;
            // above router
            return -10;
            // above small end device
        }
        );

        sim.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("cx", d => d.x).attr("cy", d => d.y);
            text.attr("x", d => d.x).attr("y", d => d.y);
            linkLabels.attr("x", d => (d.source.x + d.target.x) / 2).attr("y", d => (d.source.y + d.target.y) / 2);
        }
        );

    }

}

customElements.define("zigbee-mesh-map", ZigbeeMeshMapCard);
