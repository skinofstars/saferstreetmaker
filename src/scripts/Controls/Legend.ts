import { EventTopics } from '../EventTopics';
import { IMapLayer } from '../layers/IMapLayer';
import * as L from 'leaflet';
import PubSub from 'pubsub-js';

export class Legend {
    static create = (layers: Map<string, IMapLayer>, activeLayers: Array<string>) => {
        const legend = new L.Control({ position: 'topright' });

        const div = document.createElement('div');
        div.classList.add('legend');

        // const header = document.createElement('h4');
        // header.textContent = 'Legend';
        // div.appendChild(header);

        const ul = document.createElement('ul');

        layers.forEach((layer: IMapLayer, layerName) => {
            if (activeLayers.includes(layerName)) {
                // we want to display a checkbox beside each item.
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${layer.id}-legend-checkbox`;

                // for first load, use the visible property to determine if it is checked
                checkbox.checked = layer.visible;

                // bind for checkbox action
                checkbox.addEventListener('change', (e) => {
                    checkbox.checked
                        ? PubSub.publish(EventTopics.showLayer, layer.id)
                        : PubSub.publish(EventTopics.hideLayer, layer.id);
                });

                // create container div for checkbox and legend entry HTML component
                const div = document.createElement('div');
                div.classList.add('flex', 'pb-2');

                let legendEntry = layer.getLegendEntry();
                legendEntry.classList.add('flex-1', 'pr-2');
                div.appendChild(legendEntry);

                checkbox.classList.add('h-4', 'w-4', 'rounded', 'border-gray-300');
                div.appendChild(checkbox);

                ul.appendChild(div);
            }
        });

        // bind for checkbox visibility
        PubSub.subscribe(EventTopics.showLayer, (msg, layerId) => {
            const box = document.getElementById(`${layerId}-legend-checkbox`) as HTMLInputElement;
            if (box) box.checked = true;
        });

        PubSub.subscribe(EventTopics.hideLayer, (msg, layerId) => {
            const box = document.getElementById(`${layerId}-legend-checkbox`) as HTMLInputElement;
            if (box) box.checked = false;
        });

        div.appendChild(ul);

        legend.onAdd = (map) => {
            return div;
        };

        return legend;
    };
}
