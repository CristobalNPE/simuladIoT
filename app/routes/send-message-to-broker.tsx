import {data, Form} from "react-router";
import {Button} from "~/components/ui/button";
import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";
import {createProducer} from "~/services/producer.factory";

export async function action() {

    console.log("Called action to send message to broker")

    // This would come from the client
    const connectionString = "tcp://186.64.120.248:61616"
    const brokerType = "activemq-http";
    const username = 'admin';
    const password = 'admin';

    const msg = '{\n' +
        '  "api_key": "97637fda459d4e649648cdbb1471359e",\n' +
        '  "json_data": [\n' +
        '    {\n' +
        '      "motion_detected": false,\n' +
        '      "distance": 3.2,\n' +
        '      "timestamp": "2025-03-27T12:46:23.365Z"\n' +
        '    }\n' +
        '  ]\n' +
        '}'

    const config: ProducerConfig = {
        connectionString,
        username,
        password,
    }

    let producer: MessageProducer | null = null;
    try {
        producer = createProducer(brokerType, config);

        await producer.connect();
        await producer.sendMessage("p1-g2", msg);

        return {success: `Message sent successfully via ${brokerType}!`};
    } catch (error: any) {
        console.error(`🔴 Failed operation via ${brokerType}:`, error);
        let errorMessage = `Failed operation via ${brokerType}. Error: ${error.message}`;
        return data({error: errorMessage}, {status: 500});
    } finally {
        // disconnect
        if (producer && typeof producer.disconnect === 'function') {
            await producer.disconnect().catch(err => console.error(`🟡 Error during ${brokerType} disconnect:`, err));
        }
    }
}

export default function SendMessageToBroker() {
    return (
        <div>
            Testing
            <Form method={"POST"}>
                <Button type={"submit"}>
                    Call Action
                </Button>

            </Form>
        </div>
    )
}