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

        // todo: send notification

    }
  }
  
  export default NotificationSubscriber