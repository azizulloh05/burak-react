import React, { Dispatch } from "react";
import { Container, Stack, Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Divider from "../../components/divider";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { useParams } from "react-router-dom"; // @ts-ignore
import { FreeMode, Navigation, Thumbs } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { setChosenProduct, setRestaurant } from './slice'

import { useEffect } from 'react'
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { serverApi } from '../../../lib/config'
import { Member } from '../../../lib/types/member'
import { Product } from '../../../lib/types/product'
import MemberService from '../../services/MemberService'
import ProductService from '../../services/ProductService'
import { retrieveChosenProduct, retrieveRestaurant } from './selector'

/** REDUX SLICE*/
const actionDispatch = (dispatch: Dispatch<any>) => ({
	setRestaurant: (data: Member) => dispatch(setRestaurant(data)),
	setChosenProduct: (data: Product) => dispatch(setChosenProduct(data)),
})

/** REDUX SELECTOR */
const chosenProductRetriever = createSelector(
	retrieveChosenProduct,
	chosenProduct => ({ chosenProduct }),
)
const restaurantRetriever = createSelector(retrieveRestaurant, restaurant => ({
	restaurant,
}))

export default function ChosenProduct() {
	const { productId } = useParams<{ productId: string }>()
	const { setRestaurant, setChosenProduct } = actionDispatch(useDispatch())

	const { chosenProduct } = useSelector(chosenProductRetriever)
	const { restaurant } = useSelector(restaurantRetriever)

	useEffect(() => {
		const product = new ProductService()
		product
			.getProducts({ page: 1, limit: 100, order: 'createdAt' })
			.then((data: Product[] | any) => {
				const products = Array.isArray(data) ? data : data?.products
				const chosen = products?.find((item: Product) => item._id === productId)
				if (chosen) setChosenProduct(chosen)
			})
			.catch(err => console.log(err))

		const member = new MemberService()
		member
			.getRestaurant()
			.then(data => {
				setRestaurant(data)
			})
			.catch()
	}, [])

	if (!chosenProduct) return null
	return (
		<div className={'chosen-product'}>
			<Box className={'title'}>Product Detail</Box>
			<Container className={'product-container'}>
				<Stack className={'chosen-product-slider'}>
					<Swiper
						loop={true}
						spaceBetween={10}
						navigation={true}
						modules={[FreeMode, Navigation, Thumbs]}
						className='swiper-area'
					>
						{chosenProduct?.productImages.map((ele: string, index: number) => {
							const imagePath = `${serverApi}/${ele}`
							return (
								<SwiperSlide key={index}>
									<img className='slider-image' src={imagePath} alt='' />
								</SwiperSlide>
							)
						})}
					</Swiper>
				</Stack>
				<Stack className={'chosen-product-info'}>
					<Box className={'info-box'}>
						<strong className={'product-name'}>
							{chosenProduct?.productName}
						</strong>
						<span className={'resto-name'}>{restaurant?.memberNick}</span>
						<span className={'resto-name'}>{restaurant?.memberPhone}</span>
						<Box className={'rating-box'}>
							<Rating name='half-rating' defaultValue={2.5} precision={0.5} />
							<div className={'evaluation-box'}>
								<div className={'product-view'}>
									<RemoveRedEyeIcon sx={{ mr: '10px' }} />
									<span>{chosenProduct?.productViews}</span>
								</div>
							</div>
						</Box>
						<p className={'product-desc'}>{chosenProduct?.productDesc}</p>
						<Divider height='1' width='100%' bg='#000000' />
						<div className={'product-price'}>
							<span>Price:</span>
							<span>{chosenProduct.productPrice}</span>
						</div>
						<div className={'button-box'}>
							<Button variant='contained'>Add To Basket</Button>
						</div>
					</Box>
				</Stack>
			</Container>
		</div>
	)
}

function useDispatch(): React.Dispatch<any> {
	return useReduxDispatch()
}
