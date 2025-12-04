import React from 'react'
import "./Add_Item_form.css";


export default function Add_Item_form() {

      function AddItem(){
             
          alert("Successful!");
      }

  return (
    <div>
        <div>
            <div id="background_image_AddFrom">

                <div class="row">

                    <div class="col-es-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4"></div>

                    <div class="col-es-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4" id="form_background_AddFrom">

                        <br/>

                        <span id="Main_topic">Post Your Item for Sale</span>
                         <br/><br/>

                        <span class="mb-3">Item Name:</span>
                        <input type="text" class="form-control" placeholder="Item Name"/>

                        <br/>

                        <span>Description:</span>
                        <textarea col="10" row="20" class="form-control" placeholder='About The Item'></textarea>

                         <br/>

                         <span>Categories:</span>
                        <select name="Categories" class="form-control">
                            <option value="Electronics Device">Electronics Device</option>
                            <option value="Furniture">Furniture</option>
                            <option value="cloth">cloth</option>
                            <option value="Sports Item">Sports Item</option>
                            <option value="Vehicle  Parts">Vehicle  Parts</option>
                            <option value="others">others</option>
                        </select>

                        <br/>

                        <span>price:</span>
                        <input type="number" class="form-control" placeholder="LKR"/>

                        <br/>

                        <input type="checkbox" />
                        <span>Negotiable</span>

                        <br/><br/>

                        <span>Location:</span>
                        <input type="text" class="form-control" placeholder='Location'/>

                        <br/>

                        <span>Phone Number:</span>
                        <input type="number" class="form-control" placeholder='phone Number'/>

                        <br/>

                        <span>Date:</span>
                        <input type="date" class="form-control" placeholder='Date'/>

                        <br/>

                        <span>Quantity:</span>
                        <input type="number" class="form-control" placeholder='1'/>

                        <br/>

                        <a href="/Sale_Add_Item" type="submit" class="btn btn-success" id="submit-AddItemForm" onClick={AddItem}>Submit</a>
      
                    </div>

                    <div class="col-es-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4"></div>

                </div>
            </div>
        </div>
    </div>
  )
}
