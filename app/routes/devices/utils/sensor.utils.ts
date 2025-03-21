import {type SensorCategory, sensorCategorySchema} from "~/routes/devices/schemas/sensor-types.schema";

type SensorCategoryDisplay = {
    name: string;
    value: SensorCategory;
};

export function getSensorCategories(): SensorCategoryDisplay[] {
    const categories = sensorCategorySchema.options;

    return categories.map(category => {
        let displayName = '';

        switch (category) {
            case 'temperature':
                displayName = 'Temperatura y Humedad';
                break;
            case 'pressure':
                displayName = 'Presión y Altitud';
                break;
            case 'motion':
                displayName = 'Detección de Movimiento';
                break;
            case 'voltage':
                displayName = 'Voltaje y Corriente';
                break;
            case 'custom':
                displayName = 'Personalizado';
                break;
        }

        return {
            name: displayName,
            value: category
        };
    });
}