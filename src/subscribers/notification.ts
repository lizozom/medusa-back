import { PubSub } from '@google-cloud/pubsub';
import { OrderService } from '@medusajs/medusa';

class NotificationSubscriber {
    private orderService: OrderService;

    constructor({ eventBusService, orderService }) {
        eventBusService.subscribe(
        "order.placed", 
        this.handleOrder
      )
      this.orderService = orderService;
    }

    handleOrder  = async (data) => {
        console.log("New Order: " + data.id);
        const order = await this.orderService.retrieve(data.id, { relations: ["items"] });
        const pubsub = new PubSub({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, 
            projectId: 'aushia' 
        });
        const topic = pubsub.topic("projects/aushia/topics/order-notifications");
        console.log(order);
        const items = order.items.map((item) => {
            return {
                title: item.title,
                quantity: item.quantity,
            };
        })
        const payload = {
            id: data.id,
            items,
        };
        console.log("Message payload:",  payload);
        const dataBuffer = Buffer.from(JSON.stringify(payload));


        try {
          const messageId = await topic
            .publishMessage({data: dataBuffer});
          console.log(`Message ${messageId} published.`);
        } catch (error) {
          console.error(`Received error while publishing: ${error.message}`);
          process.exitCode = 1;
        }

    }
  }
  
  export default NotificationSubscriber