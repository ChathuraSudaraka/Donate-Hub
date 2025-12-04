import React from 'react'
import "./Sale_Add_item.css"

export default function Sale() {

   
  return (
    <div>
        <div id="backgroundimage-sale-add">
              <div class="row">
                  <div class="col-12" id="space-sale-add">
                      <span id="green-market-sale-add">Green  Market</span>
                  </div>

                  <div class="col-12">
                    <span id="Save-your-planet-sale-add"> Save your planet</span>
                    <br/>
                    <span id="and-sale">  & </span>
                    <br/>
                    <span id="save-your-committee-sale-add">save your committee</span>
                  </div>

                  <div class="col-12 mt-4 mb-5">
                      <span id="paragraph-sale-add">
                        Sell your pre-loved items and give them a new life!  The Green Market lets you list classical, second-hand, or
                      </span>

                      <br/>

                      <span id="paragraph-sale-add"> 
                        reusable products for sale,connecting you with eco-conscious buyers who care about sustainability.
                     </span>
                  </div>

                  <div>
                    <a href="/Add_Item_form" type="button" class="btn btn-success" id="Register-Now-sale-add">Add Item</a>
                  </div>

              </div>
        </div>
    </div>
  )
}
