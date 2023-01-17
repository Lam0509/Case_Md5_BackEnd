import {OrderDetail} from "../../entity/OrderDetail";
import {AppDataSource} from "../../data-source";
import {Order} from "../../entity/Order";

const orderRepository = AppDataSource.getRepository(Order);
const orderDetailRepository = AppDataSource.getRepository(OrderDetail);

class OrderController {
    async showList(req, res) {
        const orders = await orderDetailRepository.createQueryBuilder('order_detail')
            .innerJoin('order_detail.order', 'order')
            .innerJoin('order.user', 'user')
            .innerJoin('order.shipper', 'shipper')
            .innerJoin('order_detail.product', 'product')
            .select('order.id, order.date, order.status')
            .addSelect('user.name', 'user_name')
            .addSelect('shipper.name', 'shipper_name')
            .addSelect('SUM(order_detail.quantity * product.price)', 'total_Money')
            .groupBy('order.id')
            .orderBy('order.date', 'DESC')
            .getRawMany()

        res.status(200).json(orders)
    }

    // Bên user
    async add(req, res) {

    }

    async showOrderDetail(req, res) {

        const id = +req.params.id;
        const orderDetail = await orderDetailRepository.createQueryBuilder('order_detail')
            .innerJoin('order_detail.order', 'order')
            .innerJoin('order_detail.product', 'product')
            .select('product.name, product.image, product.price, order_detail.quantity')
            .where('order.id = :orderId', {orderId: id})
            .getRawMany()

        res.status(200).json(orderDetail);
    }

    async search(req, res) {
        let date = req.query.date;
        let status = req.query.status;
        let user = req.query.user;
        let query = orderRepository.createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .innerJoin('order.shipper', 'shipper')
            .select('order.id, order.date, user.name, order.status')
            .addSelect('shipper.name', 's_name')
        if (date) {
            query.where('order.date = :date', {date: date})
        }
        if (status) {
            query.andWhere('order.status = :status', {status: status})
        }
        if (user && user !== '') {
            query.andWhere('user.name LIKE :name', {name: `%${user}%`})
        }
        const orders = await query.getRawMany();
        res.status(200).json(orders)
    }

    // Lấy hết status
    async getStatus(req, res) {
        const allStatus = await orderRepository.createQueryBuilder('order')
            .select('DISTINCT(order.status) as status')
            .execute();
        res.json(allStatus);
    }

    async update(req, res) {
        await orderRepository.createQueryBuilder('order')
            .update()
            .set({status: req.body.status})
            .where('id = :id', {id: req.params.id})
            .execute()
        res.json('success')
    }
}

const orderController = new OrderController();

export default orderController;