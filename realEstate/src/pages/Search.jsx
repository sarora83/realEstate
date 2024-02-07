import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from'react-router-dom';

export default function Search() {
    const [sidebardata, setSidebardata] = useState({

        searchTerm: '',
        type: 'all',
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order:'desc',
   
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    console.log(listings);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const urlSearchTerm =  urlParams.get('searchTerm');
        const urlType =  urlParams.get('type');
        const urlParking =  urlParams.get('parking');
        const urlFurnished =  urlParams.get('furnished');
        const urlOffer =  urlParams.get('offer');
        const urlSort =  urlParams.get('sort');
        const urlOrder =  urlParams.get('order');
        
        if(urlSearchTerm || urlType || urlParking || urlFurnished || urlOffer || urlSort || urlOrder) {
            setSidebardata({
                searchTerm: urlSearchTerm || '',
                type: urlType || 'all',
                parking:  urlParking === 'true'? true : false,
                furnished:  urlFurnished === 'true'? true : false,
                offer:  urlOffer === 'true'? true : false,
                sort: urlSort || 'created_at',
                order: urlOrder || 'desc',
        
        });}

        const fetchlistings = async () => {

            setLoading(true);
            const searchQuery = urlParams.toString();
            const res = await  fetch(`/api/listing/get?${searchQuery}`);
            const data = await res.json();
            setListings(data);
            setLoading(false);


        };

        fetchlistings();

        }, [location.search]

   );

    const handleChange = (e) => {

        if(e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
            setSidebardata({...sidebardata, type: e.target.id});
    }
        if(e.target.id === 'searchTerm') {
            setSidebardata({...sidebardata, searchTerm: e.target.value});
        }

        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setSidebardata({...sidebardata, [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false});
        }

        if(e.target.id ==='sort_order') {
            const sort = e.target.value.split('_')[0] || 'created_at';
            const order = e.target.value.split('_')[1] || 'desc';

            setSidebardata({...sidebardata, sort, order});
        }

}

  const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sidebardata.searchTerm);
        urlParams.set('type', sidebardata.type);
        urlParams.set('parking', sidebardata.parking);
        urlParams.set('furnished', sidebardata.furnished);
        urlParams.set('offer', sidebardata.offer);
        urlParams.set('sort', sidebardata.sort);
        urlParams.set('order', sidebardata.order);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);



  }
  return (
    <div className='flex flex-col gap-4 md:flex-row'>
        <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                <div className='flex items-center gap-2 '>
                    <label className='whitespace-nowrap font-semibold'>Search Term:</label>
                    <input type="text" id='searchTerm' placeholder='Search ...'
                    className='border rounded-lg p-3 w-full'
                    value={sidebardata.searchTerm}
                    onChange={handleChange}
                    />
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                    <label className='font-semibold'>Type:</label>

                    <div className='flex gap-2'>
                    <input type="checkbox" id='all' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.type === 'all'}
                    />
                    <span>Rent & Sale</span>
                    </div>

                    <div className='flex gap-2'>
                    <input type="checkbox" id='rent' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.type === 'rent'}/>
                    <span>Rent</span>
                    </div>

                    <div className='flex gap-2'>
                    <input type="checkbox" id='sale' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.type === 'sale'}/>
                    <span>Sale</span>
                    </div>

                    <div className='flex gap-2'>
                    <input type="checkbox" id='offer' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.offer}/>
                    <span>Offer</span>
                    </div>
                </div>
                <div className='flex items-center flex-wrap gap-2'>
                    <label className='font-semibold'>Amenities:</label>
                    <div className='flex gap-2'>
                    <input type="checkbox" id='parking' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.parking}/>
                    <span>Parking</span>
                    </div>
                    <div className='flex gap-2'>
                    <input type="checkbox" id='furnished' className='w-5'
                    onChange={handleChange}
                    checked={sidebardata.furnished}/>
                    <span>Furnished</span>
                    </div>
                </div>
            <div className='flex items-center flex-wrap gap-2'>
                <label className='font-semibold'>Sort:</label>
                <select
                onChange={handleChange}
                defaultValue={'createdAt_desc'}
                id= "sort_order" className='border rounded-lg p-3'>
                    <option value='regularPrice_desc'>Price High to Low</option>
                    <option value='regularPrice_asc'>Price Low to High</option>
                    <option value='createdAt_desc'>Latest</option>
                    <option value='createdAt_asc'>Oldest</option>
                </select>
                </div>
            <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded-md'>Search</button>


            </form>
        </div>
        <div className='flex flex-col gap-4'>
            <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Listing Results</h1>
            </div>


    </div>
  )
}
